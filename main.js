// Get document element
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');

// Initialize typing mode variables
let typingMode = 'wordcount';
let wordCount;
let timeCount;

// Initialize dynamic variables
let randomWords = [];
let wordList = [];
let currentWord = 0;
let correctKeys = 0;
let startDate = 0;
let timer;
let timerActive = false;
let punctuation = false;

// Get cookies
getCookie('theme') === '' ? setTheme('light') : setTheme(getCookie('theme'));
getCookie('language') === '' ? setLanguage('english') : setLanguage(getCookie('language'));
getCookie('wordCount') === '' ? setWordCount(50) : setWordCount(getCookie('wordCount'));
getCookie('timeCount') === '' ? setTimeCount(60) : setTimeCount(getCookie('timeCount'));
getCookie('typingMode') === '' ? setTypingMode('wordcount') : setTypingMode(getCookie('typingMode'));
getCookie('punctuation') === '' ? setPunctuation('false') : setPunctuation(getCookie('punctuation'));

// Find a list of words and display it to textDisplay
function setText() {
  // Reset
  wordList = [];
  currentWord = 0;
  correctKeys = 0;
  inputField.value = '';
  timerActive = false;
  clearTimeout(timer);
  textDisplay.style.display = 'block';
  inputField.className = '';

  switch (typingMode) {
    case 'wordcount':
      textDisplay.style.height = 'auto';
      textDisplay.innerHTML = '';
      wordList = [];
      for (i = 0; i < wordCount; i++) {
        let n = Math.floor(Math.random() * randomWords.length);
        wordList.push(randomWords[n]);
      }
      break;

    case 'time':
      textDisplay.style.height = '3.2rem';
      document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
      textDisplay.innerHTML = '';
      wordList = [];
      for (i = 0; i < 500; i++) {
        let n = Math.floor(Math.random() * randomWords.length);
        wordList.push(randomWords[n]);
      }
  }

  if (punctuation) addPunctuations();
  showText();
  inputField.focus();
}

function addPunctuations() {
  if (wordList[0] !== undefined) {
    // Capitalize first word
    wordList[0] = wordList[0][0].toUpperCase() + wordList[0].slice(1);

    // Add comma, fullstop, question mark, exclamation mark, semicolon. Capitalize the next word
    for (i = 0; i < wordList.length; i++) {
      const ran = Math.random();
      if (i < wordList.length - 1) {
        if (ran < 0.03) {
          wordList[i] += ',';
        } else if (ran < 0.05) {
          wordList[i] += '.';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.06) {
          wordList[i] += '?';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.07) {
          wordList[i] += '!';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.08) {
          wordList[i] += ';';
        }
      }
    }
    wordList[wordList.length - 1] += '.';

    // Add quotation marks
  }
}

// Display text to textDisplay
function showText() {
  wordList.forEach(word => {
    let span = document.createElement('span');
    span.innerHTML = word + ' ';
    textDisplay.appendChild(span);
  });
  textDisplay.firstChild.classList.add('highlight');
}

// Key is pressed in input field
inputField.addEventListener('keydown', e => {
  // Add wrong class to input field
  switch (typingMode) {
    case 'wordcount':
      if (currentWord < wordList.length) inputFieldClass();
    case 'time':
      if (timerActive) inputFieldClass();
  }
  function inputFieldClass() {
    if (e.key >= 'a' && e.key <= 'z') {
      let inputWordSlice = inputField.value + e.key;
      let currentWordSlice = wordList[currentWord].slice(0, inputWordSlice.length);
      inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
    } else if (e.key === 'Backspace') {
      let inputWordSlice = e.ctrlKey ? '' : inputField.value.slice(0, inputField.value.length - 1);
      let currentWordSlice = wordList[currentWord].slice(0, inputWordSlice.length);
      inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
    } else if (e.key === ' ') {
      inputField.className = '';
    }
  }

  // If it is the first character entered
  if (currentWord === 0 && inputField.value === '') {
    switch (typingMode) {
      case 'wordcount':
        startDate = Date.now();
        break;

      case 'time':
        if (!timerActive) {
          startTimer(timeCount);
          timerActive = true;
        }
        function startTimer(time) {
          if (time > 0) {
            document.querySelector(`#tc-${timeCount}`).innerHTML = time;
            timer = setTimeout(() => {
              time--;
              startTimer(time);
            }, 1000);
          } else {
            timerActive = false;
            textDisplay.style.display = 'none';
            inputField.className = '';
            document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
            showResult();
          }
        }
    }
  }

  // If it is the space key check the word and add correct/wrong class
  if (e.key === ' ') {
    e.preventDefault();

    if (inputField.value !== '') {
      // Scroll down text when reach new line
      if (typingMode === 'time') {
        const currentWordPosition = textDisplay.childNodes[currentWord].getBoundingClientRect();
        const nextWordPosition = textDisplay.childNodes[currentWord + 1].getBoundingClientRect();
        if (currentWordPosition.top < nextWordPosition.top) {
          for (i = 0; i < currentWord + 1; i++) textDisplay.childNodes[i].style.display = 'none';
        }
      }

      // If it is not the last word increment currentWord,
      if (currentWord < wordList.length - 1) {
        if (inputField.value === wordList[currentWord]) {
          textDisplay.childNodes[currentWord].classList.add('correct');
          correctKeys += wordList[currentWord].length + 1;
        } else {
          textDisplay.childNodes[currentWord].classList.add('wrong');
        }
        textDisplay.childNodes[currentWord + 1].classList.add('highlight');
      } else if (currentWord === wordList.length - 1) {
        textDisplay.childNodes[currentWord].classList.add('wrong');
        showResult();
      }

      inputField.value = '';
      currentWord++;
    }

    // Else if it is the last word and input word is correct show the result
  } else if (currentWord === wordList.length - 1) {
    if (inputField.value + e.key === wordList[currentWord]) {
      textDisplay.childNodes[currentWord].classList.add('correct');
      correctKeys += wordList[currentWord].length;
      currentWord++;
      showResult();
    }
  }
});

// Calculate and display result
function showResult() {
  let words, minute, acc;
  switch (typingMode) {
    case 'wordcount':
      words = correctKeys / 5;
      minute = (Date.now() - startDate) / 1000 / 60;
      let totalKeys = -1;
      wordList.forEach(e => (totalKeys += e.length + 1));
      acc = Math.floor((correctKeys / totalKeys) * 100);
      break;

    case 'time':
      words = correctKeys / 5;
      minute = timeCount / 60;
      let sumKeys = -1;
      for (i = 0; i < currentWord; i++) {
        sumKeys += wordList[i].length + 1;
      }
      acc = acc = Math.min(Math.floor((correctKeys / sumKeys) * 100), 100);
  }
  let wpm = Math.floor(words / minute);
  document.querySelector('#right-wing').innerHTML = `WPM: ${wpm} / ACC: ${acc}`;
}

// Command actions
document.addEventListener('keydown', e => {
  // Modifiers Windows: [Alt], Mac: [Cmd + Ctrl]
  if (e.altKey || (e.metaKey && e.ctrlKey)) {
    // [mod + t] => Change the theme
    if (e.key === 't') {
      setTheme(inputField.value);
    }
    // [mod + l] => Change the language
    if (e.key === 'l') {
      setLanguage(inputField.value);
    }

    // [mod + m] => Change the typing mode
    if (e.key === 'm') {
      setTypingMode(inputField.value);
    }

    // [mod + p] => Change punctuation active
    if (e.key === 'p') {
      setPunctuation(inputField.value);
    }
  }
});

function setTheme(_theme) {
  const theme = _theme.toLowerCase();
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', `themes/${theme}.css`);
  xhttp.onload = () => {
    if (xhttp.status === 200) {
      setCookie('theme', theme, 90);
      document.querySelector('#theme').setAttribute('href', `themes/${theme}.css`);
      setText();
    }
  };
  xhttp.send();
}

function setLanguage(_lang) {
  const lang = _lang.toLowerCase();
  fetch('texts/random.json')
    .then(response => response.json())
    .then(json => {
      if (typeof json[lang] !== 'undefined') {
        randomWords = json[lang];
        setCookie('language', lang, 90);
        setText();
      } else {
        console.error(`language ${lang} is undefine`);
      }
    })
    .catch(err => console.error(err));
}

function setTypingMode(_mode) {
  const mode = _mode.toLowerCase();
  switch (mode) {
    case 'wordcount':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'inline';
      document.querySelector('#time-count').style.display = 'none';
      setText();
      break;
    case 'time':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'none';
      document.querySelector('#time-count').style.display = 'inline';
      setText();
      break;
    default:
      console.error(`mode ${mode} is undefine`);
  }
}

function setPunctuation(_punc) {
  const punc = _punc.toLowerCase();
  if (punc === 'true') {
    punctuation = true;
    setCookie('punctuation', true, 90);
    setText();
  } else if (punc === 'false') {
    punctuation = false;
    setCookie('punctuation', false, 90);
    setText();
  }
}

function setWordCount(wc) {
  setCookie('wordCount', wc, 90);
  wordCount = wc;
  document.querySelectorAll('#word-count > span').forEach(e => (e.style.borderBottom = ''));
  document.querySelector(`#wc-${wordCount}`).style.borderBottom = '2px solid';
  setText();
}

function setTimeCount(tc) {
  setCookie('timeCount', tc, 90);
  timeCount = tc;
  document.querySelectorAll('#time-count > span').forEach(e => {
    e.style.borderBottom = '';
    e.innerHTML = e.id.substring(3, 6);
  });
  document.querySelector(`#tc-${timeCount}`).style.borderBottom = '2px solid';
  setText();
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
