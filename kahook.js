// ==UserScript==
// @name         KaHook! SynapLink Version
// @version      1.3.1
// @namespace    https://github.com/SynapLink
// @description  Enhanced Kahoot hack with side panel UI, killswitch, and config saving. Forked from jokeri2222
// @author       https://github.com/SynapLink; jokeri2222; https://github.com/Darklegand711
// @match        https://kahoot.it/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @grant        none
// ==/UserScript==

var Version = '1.3.1'

var questions = [];
var info = {
    numQuestions: 0,
    questionNum: -1,
    lastAnsweredQuestion: -1,
    defaultIL:true,
    ILSetQuestion:-1,
};
var PPT = 950;
var Answered_PPT = 950;
var autoAnswer = false;
var showAnswers = false;
var inputLag = 100;
var menuActive = true;

// Default customization settings
var settings = {
    menuColor: '#381272',
    headerColor: '#321066',
    accentColor: '#4a1a8a',
    pageBlur: 0,
    pageBrightness: 100,
    pageOpacity: 100
};

// Load settings from localStorage
function loadSettings() {
    try {
        const saved = localStorage.getItem('kahack_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            settings = { ...settings, ...parsed };
            console.log('[KaHook] Settings loaded from localStorage');
        }
    } catch (e) {
        console.error('[KaHook] Error loading settings:', e);
    }
}

// Save settings to localStorage
function saveSettings() {
    try {
        localStorage.setItem('kahack_settings', JSON.stringify(settings));
        console.log('[KaHook] Settings saved to localStorage');
    } catch (e) {
        console.error('[KaHook] Error saving settings:', e);
    }
}

// Load settings on startup
loadSettings();

function FindByAttributeValue(attribute, value, element_type)    {
  element_type = element_type || "*";
  var All = document.getElementsByTagName(element_type);
  for (var i = 0; i < All.length; i++)       {
    if (All[i].getAttribute(attribute) == value) { return All[i]; }
  }
}

function applyPageEffects() {
    const gameContainer = document.querySelector('[data-functional-selector="game-container"]');
    if (gameContainer) {
        gameContainer.style.filter = `blur(${settings.pageBlur}px) brightness(${settings.pageBrightness}%) opacity(${settings.pageOpacity}%)`;
        gameContainer.style.transition = 'filter 0.2s';
    }
}

const uiElement = document.createElement('div');
uiElement.className = 'kahack-panel';
uiElement.style.position = 'fixed';
uiElement.style.top = '0';
uiElement.style.right = '0';
uiElement.style.width = '350px';
uiElement.style.height = '100vh';
uiElement.style.backgroundColor = settings.menuColor;
uiElement.style.borderRadius = '0';
uiElement.style.boxShadow = '-5px 0 15px 0px rgba(0, 0, 0, 0.7)';
uiElement.style.zIndex = '9999';
uiElement.style.borderLeft = '3px solid rgba(255, 255, 255, 0.1)';
uiElement.style.overflowY = 'auto';
uiElement.style.overflowX = 'hidden';
uiElement.style.transition = 'transform 0.3s';
uiElement.style.transform = 'translateX(0)';

// Scrollbar styling
const scrollbarStyle = document.createElement('style');
scrollbarStyle.textContent = `
.kahack-panel::-webkit-scrollbar {
    width: 10px;
}
.kahack-panel::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
}
.kahack-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid transparent;
}
.kahack-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
`;
document.head.appendChild(scrollbarStyle);

const handle = document.createElement('div');
handle.className = 'handle';
handle.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
handle.style.fontSize = '18px';
handle.textContent = 'KaHook!';
handle.style.color = 'white';
handle.style.width = '100%';
handle.style.height = '50px';
handle.style.backgroundColor = settings.headerColor;
handle.style.borderRadius = '0';
handle.style.textAlign = 'center';
handle.style.lineHeight = '50px';
handle.style.fontWeight = 'bold';
handle.style.borderBottom = '2px solid rgba(255, 255, 255, 0.1)';
uiElement.appendChild(handle);

const closeButton = document.createElement('div');
closeButton.className = 'close-button';
closeButton.textContent = '✕';
closeButton.style.position = 'absolute';
closeButton.style.top = '0';
closeButton.style.right = '0';
closeButton.style.width = '50px';
closeButton.style.height = '50px';
closeButton.style.backgroundColor = '#cc0000';
closeButton.style.color = 'white';
closeButton.style.borderRadius = '0';
closeButton.style.display = 'flex';
closeButton.style.justifyContent = 'center';
closeButton.style.alignItems = 'center';
closeButton.style.cursor = 'pointer';
closeButton.style.transition = 'background-color 0.1s';
closeButton.style.fontSize = '20px';
closeButton.style.fontWeight = 'bold';
closeButton.addEventListener('mouseenter', () => closeButton.style.backgroundColor = '#ff0000');
closeButton.addEventListener('mouseleave', () => closeButton.style.backgroundColor = '#cc0000');
handle.appendChild(closeButton);

const minimizeButton = document.createElement('div'); // bugged minimize btn, uncomment if wanna try to fix
// minimizeButton.className = 'minimize-button';
// minimizeButton.textContent = '─';
// minimizeButton.style.color = 'white';
// minimizeButton.style.position = 'absolute';
// minimizeButton.style.top = '0';
// minimizeButton.style.right = '50px';
// minimizeButton.style.width = '50px';
//minimizeButton.style.height = '50px';
//minimizeButton.style.backgroundColor = '#555555';
//minimizeButton.style.borderRadius = '0';
//minimizeButton.style.display = 'flex';
//minimizeButton.style.justifyContent = 'center';
//minimizeButton.style.alignItems = 'center';
//minimizeButton.style.cursor = 'pointer';
//minimizeButton.style.transition = 'background-color 0.1s';
//minimizeButton.style.fontSize = '20px';
//minimizeButton.style.fontWeight = 'bold';
//minimizeButton.addEventListener('mouseenter', () => minimizeButton.style.backgroundColor = '#777777');
//minimizeButton.addEventListener('mouseleave', () => minimizeButton.style.backgroundColor = '#555555');
//handle.appendChild(minimizeButton);

// Killswitch indicator
// const killswitchIndicator = document.createElement('div');
// killswitchIndicator.style.position = 'fixed';
// killswitchIndicator.style.top = '20px';
// killswitchIndicator.style.right = '20px';
// killswitchIndicator.style.padding = '10px 20px';
// killswitchIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
// killswitchIndicator.style.color = '#00ff00';
// killswitchIndicator.style.fontFamily = 'monospace';
// killswitchIndicator.style.fontSize = '14px';
// killswitchIndicator.style.border = '2px solid #00ff00';
// killswitchIndicator.style.zIndex = '10000';
// killswitchIndicator.style.display = 'none';
// killswitchIndicator.textContent = 'PKS';
// killswitchIndicator.style.fontWeight = 'bold';
// killswitchIndicator.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
// document.body.appendChild(killswitchIndicator);

const contentContainer = document.createElement('div');
contentContainer.style.padding = '15px';

const header = document.createElement('h2');
header.textContent = 'QUIZ ID *NOT PIN';
header.style.display = 'block';
header.style.margin = '15px 0 10px 0';
header.style.textAlign = 'center';
header.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
header.style.fontSize = '20px';
header.style.color = 'white';
header.style.textShadow = `2px 2px 0 rgb(0, 0, 0)`;
contentContainer.appendChild(header);

const inputContainer = document.createElement('div');
inputContainer.style.display = 'flex';
inputContainer.style.justifyContent = 'center';
inputContainer.style.marginBottom = '15px';

const inputBox = document.createElement('input');
inputBox.type = 'text';
inputBox.style.color = 'black';
inputBox.placeholder = 'Quiz Id here...';
inputBox.style.width = '90%';
inputBox.style.height = '30px';
inputBox.style.padding = '5px';
inputBox.style.border = '2px solid black';
inputBox.style.borderRadius = '0';
inputBox.style.outline = 'none';
inputBox.style.textAlign = 'center';
inputBox.style.fontSize = '14px';
inputBox.style.transition = 'background-color 0.2s, border-color 0.2s';

inputContainer.appendChild(inputBox);
contentContainer.appendChild(inputContainer);

const header2 = document.createElement('h2');
header2.textContent = 'POINTS PER QUESTION !DOES NOT WORK!';
header2.style.display = 'block';
header2.style.margin = '15px 0 10px 0';
header2.style.textAlign = 'center';
header2.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
header2.style.fontSize = '16px';
header2.style.color = 'white';
header2.style.textShadow = `2px 2px 0 rgb(0, 0, 0)`;
contentContainer.appendChild(header2);

const sliderContainer = document.createElement('div');
sliderContainer.style.width = '100%';
sliderContainer.style.margin = '10px 0';
sliderContainer.style.display = 'flex';
sliderContainer.style.flexDirection = 'column';
sliderContainer.style.alignItems = 'center';

const pointsLabel = document.createElement('span');
pointsLabel.textContent = 'Points per Question: 950';
pointsLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
pointsLabel.style.fontSize = '14px';
pointsLabel.style.margin = '5px';
pointsLabel.style.color = 'white';
sliderContainer.appendChild(pointsLabel);

const pointsSlider = document.createElement('input');
pointsSlider.type = 'range';
pointsSlider.min = '500';
pointsSlider.max = '1000';
pointsSlider.value = '950';
pointsSlider.style.width = '90%';
pointsSlider.style.margin = '5px';
pointsSlider.style.border = 'none';
pointsSlider.style.outline = 'none';
pointsSlider.style.cursor = 'ew-resize';
pointsSlider.className = 'custom-slider';

sliderContainer.appendChild(pointsSlider);
contentContainer.appendChild(sliderContainer);

pointsSlider.addEventListener('input', () => {
    const points = +pointsSlider.value;
    PPT = points;
    pointsLabel.textContent = 'Points per Question: ' + points;
});

const header3 = document.createElement('h2');
header3.textContent = 'ANSWERING';
header3.style.display = 'block';
header3.style.margin = '15px 0 10px 0';
header3.style.textAlign = 'center';
header3.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
header3.style.fontSize = '20px';
header3.style.color = 'white';
header3.style.textShadow = `2px 2px 0 rgb(0, 0, 0)`;
contentContainer.appendChild(header3);

const autoAnswerSwitchContainer = document.createElement('div');
autoAnswerSwitchContainer.className = 'switch-container';
autoAnswerSwitchContainer.style.display = 'flex';
autoAnswerSwitchContainer.style.alignItems = 'center';
autoAnswerSwitchContainer.style.justifyContent = 'space-between';
autoAnswerSwitchContainer.style.margin = '10px 0';
contentContainer.appendChild(autoAnswerSwitchContainer);

const autoAnswerLabel = document.createElement('span');
autoAnswerLabel.textContent = 'Auto Answer !DOES NOT WORK!';
autoAnswerLabel.className = 'switch-label';
autoAnswerLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
autoAnswerLabel.style.fontSize = '13px';
autoAnswerLabel.style.color = 'white';
autoAnswerLabel.style.flex = '1';
autoAnswerSwitchContainer.appendChild(autoAnswerLabel);

const autoAnswerSwitch = document.createElement('label');
autoAnswerSwitch.className = 'switch';
autoAnswerSwitchContainer.appendChild(autoAnswerSwitch);

const autoAnswerInput = document.createElement('input');
autoAnswerInput.type = 'checkbox';
autoAnswerInput.addEventListener('change', function() {
    autoAnswer = this.checked;
    info.ILSetQuestion = info.questionNum
});
autoAnswerSwitch.appendChild(autoAnswerInput);

const autoAnswerSlider = document.createElement('span');
autoAnswerSlider.className = 'slider';
autoAnswerSwitch.appendChild(autoAnswerSlider);

const showAnswersSwitchContainer = document.createElement('div');
showAnswersSwitchContainer.className = 'switch-container';
showAnswersSwitchContainer.style.display = 'flex';
showAnswersSwitchContainer.style.alignItems = 'center';
showAnswersSwitchContainer.style.justifyContent = 'space-between';
showAnswersSwitchContainer.style.margin = '10px 0';
contentContainer.appendChild(showAnswersSwitchContainer);

const showAnswersLabel = document.createElement('span');
showAnswersLabel.textContent = 'Show Answers';
showAnswersLabel.className = 'switch-label';
showAnswersLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
showAnswersLabel.style.fontSize = '14px';
showAnswersLabel.style.color = 'white';
showAnswersLabel.style.flex = '1';
showAnswersSwitchContainer.appendChild(showAnswersLabel);

const showAnswersSwitch = document.createElement('label');
showAnswersSwitch.className = 'switch';
showAnswersSwitchContainer.appendChild(showAnswersSwitch);

const showAnswersInput = document.createElement('input');
showAnswersInput.type = 'checkbox';
showAnswersInput.addEventListener('change', function() {
    showAnswers = this.checked;
});
showAnswersSwitch.appendChild(showAnswersInput);

const showAnswersSlider = document.createElement('span');
showAnswersSlider.className = 'slider';
showAnswersSwitch.appendChild(showAnswersSlider);

// CUSTOMIZATION SECTION
const header5 = document.createElement('h2');
header5.textContent = 'CUSTOMIZATION';
header5.style.display = 'block';
header5.style.margin = '15px 0 10px 0';
header5.style.textAlign = 'center';
header5.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
header5.style.fontSize = '20px';
header5.style.color = 'white';
header5.style.textShadow = `2px 2px 0 rgb(0, 0, 0)`;
contentContainer.appendChild(header5);

// Color customization
const colorContainer = document.createElement('div');
colorContainer.style.display = 'flex';
colorContainer.style.flexDirection = 'column';
colorContainer.style.alignItems = 'center';
colorContainer.style.margin = '10px 0';
colorContainer.style.gap = '8px';

const colorOptions = [
    { label: 'Menu Color', key: 'menuColor', target: uiElement },
    { label: 'Header Color', key: 'headerColor', target: handle },
    { label: 'Accent Color', key: 'accentColor', target: null }
];

colorOptions.forEach(option => {
    const colorRow = document.createElement('div');
    colorRow.style.display = 'flex';
    colorRow.style.alignItems = 'center';
    colorRow.style.gap = '10px';
    colorRow.style.width = '90%';
    colorRow.style.justifyContent = 'space-between';

    const colorLabel = document.createElement('span');
    colorLabel.textContent = option.label + ':';
    colorLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
    colorLabel.style.fontSize = '14px';
    colorLabel.style.color = 'white';
    colorRow.appendChild(colorLabel);

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = settings[option.key];
    colorPicker.style.width = '50px';
    colorPicker.style.height = '30px';
    colorPicker.style.border = '2px solid white';
    colorPicker.style.cursor = 'pointer';
    colorPicker.addEventListener('input', (e) => {
        settings[option.key] = e.target.value;
        if (option.target) {
            option.target.style.backgroundColor = e.target.value;
        }
        saveSettings(); // Save after each change
    });
    colorRow.appendChild(colorPicker);

    colorContainer.appendChild(colorRow);
});

contentContainer.appendChild(colorContainer);

// Page effects
const pageEffectsContainer = document.createElement('div');
pageEffectsContainer.style.display = 'flex';
pageEffectsContainer.style.flexDirection = 'column';
pageEffectsContainer.style.alignItems = 'center';
pageEffectsContainer.style.margin = '10px 0';
pageEffectsContainer.style.gap = '8px';

const effectOptions = [
    { label: 'Page Blur', key: 'pageBlur', min: 0, max: 20, suffix: 'px' },
    { label: 'Brightness', key: 'pageBrightness', min: 0, max: 200, suffix: '%' },
    { label: 'Opacity', key: 'pageOpacity', min: 0, max: 100, suffix: '%' }
];

effectOptions.forEach(option => {
    const effectRow = document.createElement('div');
    effectRow.style.display = 'flex';
    effectRow.style.flexDirection = 'column';
    effectRow.style.width = '90%';
    effectRow.style.gap = '5px';

    const effectLabel = document.createElement('span');
    effectLabel.textContent = `${option.label}: ${settings[option.key]}${option.suffix}`;
    effectLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
    effectLabel.style.fontSize = '14px';
    effectLabel.style.color = 'white';
    effectRow.appendChild(effectLabel);

    const effectSlider = document.createElement('input');
    effectSlider.type = 'range';
    effectSlider.min = option.min;
    effectSlider.max = option.max;
    effectSlider.value = settings[option.key];
    effectSlider.style.width = '100%';
    effectSlider.className = 'custom-slider';
    effectSlider.addEventListener('input', (e) => {
        settings[option.key] = +e.target.value;
        effectLabel.textContent = `${option.label}: ${settings[option.key]}${option.suffix}`;
        applyPageEffects();
        saveSettings(); // Save after each change
    });
    effectRow.appendChild(effectSlider);

    pageEffectsContainer.appendChild(effectRow);
});

contentContainer.appendChild(pageEffectsContainer);

// Config management buttons
const configManagement = document.createElement('div');
configManagement.style.display = 'flex';
configManagement.style.flexDirection = 'column';
configManagement.style.gap = '8px';
configManagement.style.margin = '15px 0';
configManagement.style.alignItems = 'center';

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset to Default Colors';
resetButton.style.width = '90%';
resetButton.style.padding = '10px';
resetButton.style.backgroundColor = '#ff6600';
resetButton.style.color = 'white';
resetButton.style.border = '2px solid white';
resetButton.style.cursor = 'pointer';
resetButton.style.fontSize = '14px';
resetButton.style.fontWeight = 'bold';
resetButton.style.transition = 'background-color 0.1s';
resetButton.addEventListener('mouseenter', () => resetButton.style.backgroundColor = '#ff8800');
resetButton.addEventListener('mouseleave', () => resetButton.style.backgroundColor = '#ff6600');
resetButton.addEventListener('click', () => {
    settings = {
        menuColor: '#381272',
        headerColor: '#321066',
        accentColor: '#4a1a8a',
        pageBlur: 0,
        pageBrightness: 100,
        pageOpacity: 100
    };
    saveSettings();
    location.reload(); // Reload to apply
});
configManagement.appendChild(resetButton);

const saveIndicator = document.createElement('div');
saveIndicator.style.padding = '8px';
saveIndicator.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
saveIndicator.style.border = '1px solid #00ff00';
saveIndicator.style.color = '#00ff00';
saveIndicator.style.fontSize = '12px';
saveIndicator.style.textAlign = 'center';
saveIndicator.style.fontFamily = 'monospace';
saveIndicator.textContent = '✓ Settings auto-saved to localStorage';
configManagement.appendChild(saveIndicator);

contentContainer.appendChild(configManagement);

const style = document.createElement('style');
style.textContent = `
.custom-slider {
    background: white;
    border: none;
    outline: none;
    cursor: ew-resize;
    appearance: none;
    height: 0;
}

.custom-slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: rgb(47, 47, 47);
    border-radius: 0;
    cursor: ew-resize;
    margin-top: -8px;
    border: 2px solid white;
    transition: background-color 0.1s;
}

.custom-slider::-webkit-slider-thumb:hover {
    background-color: rgb(70, 70, 70);
}

.custom-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background-color: white;
    cursor: ew-resize;
    border-radius: 0;
    background: linear-gradient(to right, red, yellow, limegreen);
    border: 1px solid rgba(0, 0, 0, 0.3);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: red;
  transition: 0.15s;
  border-radius: 0;
  border: 2px solid rgba(0, 0, 0, 0.3);
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 2px;
  background-color: rgb(43, 43, 43);
  transition: 0.15s;
  border-radius: 0;
  border: 2px solid white;
}

input:checked + .slider {
  background-color: green;
}

input:focus + .slider {
  box-shadow: 0 0 3px green;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
`;
document.head.appendChild(style);

const header4 = document.createElement('h2');
header4.textContent = 'INFO';
header4.style.display = 'block';
header4.style.margin = '15px 0 10px 0';
header4.style.textAlign = 'center';
header4.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
header4.style.fontSize = '20px';
header4.style.color = 'white';
header4.style.textShadow = `2px 2px 0 rgb(0, 0, 0)`;
contentContainer.appendChild(header4)

const questionsLabel = document.createElement('span');
questionsLabel.textContent = 'Question 0 / 0';
questionsLabel.style.display = 'block';
questionsLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
questionsLabel.style.fontSize = '14px';
questionsLabel.style.textAlign = 'center';
questionsLabel.style.margin = '10px';
questionsLabel.style.color = 'white';
contentContainer.appendChild(questionsLabel);

const inputLagLabel = document.createElement('span');
inputLagLabel.textContent = 'Input lag : 125 ms';
inputLagLabel.style.display = 'block';
inputLagLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
inputLagLabel.style.fontSize = '14px';
inputLagLabel.style.textAlign = 'center';
inputLagLabel.style.margin = '10px';
inputLagLabel.style.color = 'white';
contentContainer.appendChild(inputLagLabel);

const killswitchInfo = document.createElement('div');
killswitchInfo.style.margin = '15px 0';
killswitchInfo.style.padding = '10px';
killswitchInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
killswitchInfo.style.border = '2px solid rgba(255, 255, 255, 0.2)';
killswitchInfo.style.textAlign = 'center';

const killswitchText = document.createElement('span');
killswitchText.textContent = 'Killswitch: F2';
killswitchText.style.fontFamily = 'monospace';
killswitchText.style.fontSize = '14px';
killswitchText.style.color = '#00ff00';
killswitchText.style.fontWeight = 'bold';
killswitchInfo.appendChild(killswitchText);

contentContainer.appendChild(killswitchInfo);

const versionLabel = document.createElement('h1');
versionLabel.textContent = 'KaHook! by SynapLink V'+Version+" Forked from KaHack!";
versionLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
versionLabel.style.fontSize = '24px';
versionLabel.style.display = 'block';
versionLabel.style.textAlign = 'center';
versionLabel.style.marginTop = '20px';
versionLabel.style.marginBottom = '10px';
versionLabel.style.color = 'white';
contentContainer.appendChild(versionLabel);

const githubContainer = document.createElement('div');
githubContainer.style.textAlign = 'center';
githubContainer.style.marginTop = '10px';
githubContainer.style.marginBottom = '20px';

const githubLabel = document.createElement('span');
githubLabel.textContent = 'GitHub: ';
githubLabel.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
githubLabel.style.fontSize = '13px';
githubLabel.style.margin = '0 5px';
githubLabel.style.color = 'white';
githubContainer.appendChild(githubLabel);

const githubUrl = document.createElement('a');
githubUrl.textContent = 'jokeri2222';
githubUrl.href = 'https://github.com/jokeri2222';
githubUrl.target = '_blank';
githubUrl.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
githubUrl.style.fontSize = '13px';
githubUrl.style.margin = '0 5px';
githubUrl.style.color = 'white';
githubContainer.appendChild(githubUrl);

const githubUrl2 = document.createElement('a');
githubUrl2.textContent = 'SynapLink';
githubUrl2.href = 'https://github.com/SynapLink';
githubUrl2.target = '_blank';
githubUrl2.style.fontFamily = '"Times New Roman", "Noto Sans Arabic", "Helvetica Neue", Helvetica, Arial, sans-serif;';
githubUrl2.style.fontSize = '13px';
githubUrl2.style.margin = '0 5px';
githubUrl2.style.color = 'white';
githubContainer.appendChild(githubUrl2);

contentContainer.appendChild(githubContainer);

uiElement.appendChild(contentContainer);

closeButton.addEventListener('click', () => {
    menuActive = false;
    uiElement.style.transform = 'translateX(100%)';
    killswitchIndicator.style.display = 'block';
    autoAnswer = false;
    showAnswers = false;
});

let isMinimized = false;

minimizeButton.addEventListener('click', () => {
    isMinimized = !isMinimized;

    if (isMinimized) {
        contentContainer.style.display = 'none';
        uiElement.style.width = '50px';
        handle.textContent = '';
        minimizeButton.textContent = '+';
    } else {
        contentContainer.style.display = 'block';
        uiElement.style.width = '350px';
        handle.textContent = 'KaHook!';
        minimizeButton.textContent = '─';
    }
});

function parseQuestions(questionsJson){
    let questions = []
    questionsJson.forEach(function (question){
    let q = {type:question.type, time:question.time}
    if (['quiz', 'multiple_select_quiz'].includes(question.type)){
        var i=0
        q.answers = []
        q.incorrectAnswers = []
        question.choices.forEach(function(choise){
            if (choise.correct) {
                q.answers.push(i)
            }
            else{
                q.incorrectAnswers.push(i)
            }
            i++
        })
    }
    if (question.type == 'open_ended')
    {
        q.answers = []
        question.choices.forEach(function(choise){
            q.answers.push(choise.answer)
        })
    }
    questions.push(q)
})
    return questions
}

function handleInputChange() {
    const quizID = inputBox.value;
    const url = 'https://kahoot.it/rest/kahoots/' + quizID;

    if (quizID != "") {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('');
                }
                return response.json();
            })
            .then(data => {
                inputBox.style.backgroundColor = 'green'

                questions=parseQuestions(data.questions)
                info.numQuestions=questions.length
            })
            .catch(error => {
                inputBox.style.backgroundColor = 'red';

                info.numQuestions = 0
            });
    } else {
        inputBox.style.backgroundColor = 'white';
        info.numQuestions = 0

    }
}

inputBox.addEventListener('input', handleInputChange);

document.body.appendChild(uiElement);

function onQuestionStart(){
    console.log(inputLag)
    var question = questions[info.questionNum]
    if (showAnswers){
        highlightAnswers(question)
    }
    if (autoAnswer){
        answer(question, (question.time - question.time / (500/(PPT-500))) - inputLag)
    }
}

function highlightAnswers(question){
    question.answers.forEach(function (answer) {
        setTimeout(function() {
            const btn = FindByAttributeValue("data-functional-selector", 'answer-'+answer, "button");
            if (btn) btn.style.backgroundColor = 'rgb(0, 255, 0)';
        }, 0)
    })
    question.incorrectAnswers.forEach(function (answer) {
        setTimeout(function() {
            const btn = FindByAttributeValue("data-functional-selector", 'answer-'+answer, "button");
            if (btn) btn.style.backgroundColor = 'rgb(255, 0, 0)';
        }, 0)
    })
}

function answer(question, time) {
    Answered_PPT = PPT

    var delay = 0
    if (question.type == 'multiple_select_quiz') delay = 60
    setTimeout(function() {
        if (question.type == 'quiz') {
            const key=(+question.answers[0]+1).toString();
            const event = new KeyboardEvent('keydown', { key });
            window.dispatchEvent(event);
        }
        if (question.type == 'multiple_select_quiz') {
            question.answers.forEach(function (answer) {
                setTimeout(function() {
                    const key=(+answer+1).toString();
                    const event = new KeyboardEvent('keydown', { key });
                    window.dispatchEvent(event);
                        }, 0)
                    })
            setTimeout(function() {
               FindByAttributeValue("data-functional-selector", 'multi-select-submit-button', "button").click()
            }, 0)
        }
    }, time - delay)
}

// Killswitch functionality - F2 key
document.addEventListener('keydown', (event) => {
    if (event.key === 'F2') {
        event.preventDefault();
        menuActive = !menuActive;

        if (menuActive) {
            uiElement.style.transform = 'translateX(0)';
            killswitchIndicator.style.display = 'none';
        } else {
            uiElement.style.transform = 'translateX(100%)';
            killswitchIndicator.style.display = 'block';
            autoAnswer = false;
            showAnswers = false;
        }
    }
});

setInterval(function () {
    var textElement = FindByAttributeValue("data-functional-selector", "question-index-counter", "div")
    if (textElement){
        info.questionNum = +textElement.textContent - 1
    }
    if (FindByAttributeValue("data-functional-selector", 'answer-0', "button") && info.lastAnsweredQuestion != info.questionNum)
    {
        info.lastAnsweredQuestion = info.questionNum
        onQuestionStart()
    }
    if (autoAnswer){
        if (info.ILSetQuestion != info.questionNum){
            var ppt = Answered_PPT
            if (ppt > 987) ppt = 1000
            var incrementElement = FindByAttributeValue("data-functional-selector", "score-increment", "span")
            if (incrementElement){
                info.ILSetQuestion = info.questionNum
                var increment = +incrementElement.textContent.split(" ")[1]
                if (increment != 0){
                    inputLag += (ppt-increment)*15
                    if (inputLag < 0) {
                        inputLag -= (ppt-increment)*15
                        inputLag += (ppt-increment/2)*15
                    }
                    inputLag = Math.round(inputLag)
                }
            }
        }
    }
    questionsLabel.textContent = 'Question '+(info.questionNum+1)+' / '+info.numQuestions;
    inputLagLabel.textContent = 'Input lag : '+inputLag+' ms';

    applyPageEffects();
}, 1)
