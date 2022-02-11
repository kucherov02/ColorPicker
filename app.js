//Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const hexTitlles = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtns = document.querySelectorAll(".adjust");
const closeAdjustBtns = document.querySelectorAll(".close-adjustment");
const sliderBoxes = document.querySelectorAll(".sliders");
const lockBtns = document.querySelectorAll(".lock");
let initialColor;
//Array for Local Storage
let savedPalettes = [];

//Eventlisteners
generateBtn.addEventListener("click", randomColors);

sliders.forEach(slider =>{
    slider.addEventListener("input", hslControls);
})

colorDivs.forEach((div, index)=>{
    div.addEventListener("input", ()=>{
        changeTextUI(index);
    })
})

hexTitlles.forEach(hex =>{
    hex.addEventListener("click", ()=>{
        copyHex(hex);
    })
})

popup.addEventListener("transitionend", ()=>{
    setTimeout(()=>{
        const popupBox = popup.children[0];
        popup.classList.remove("active");
        popupBox.classList.remove("active");
    }, 500);
})

adjustBtns.forEach((button, index)=>{
    button.addEventListener("click",()=>{
        openBox(index);
    })
})

closeAdjustBtns.forEach((button, index)=>{
    button.addEventListener("click",()=>{
        closeBox(index);
    })
})

lockBtns.forEach((button, index) => {
    button.addEventListener("click", e => {
      lockLayer(e, index);
    });
  });


//Functions
//Color generator
function randomColors(){
    initialColor = [];

    colorDivs.forEach(div=>{
        //Getting random color (hex-code)
        const randomColor = chroma.random();

        const hexText = div.children[0];

        if (div.classList.contains("locked")) {
            initialColor.push(hexText.innerText);
            return;
          } else {
            initialColor.push(chroma(randomColor).hex());
          }

        //Adding color to stylezation
        div.style.background = randomColor;
        hexText.innerText = randomColor;


        const adjustBtn = div.children[1].children[0];
        const lockBtn = div.children[1].children[1];

        //Checking for a contrast
        checkContrast(randomColor, hexText);
        checkContrast(randomColor, adjustBtn);
        checkContrast(randomColor, lockBtn);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");

        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSlider(color, hue, brightness, saturation);
    })

    resetInputs();
}

//Checking for a contrast
function checkContrast(color, text){
    const luminance = chroma(color).luminance();

    if(luminance > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    }
}

//Add the color palet to the inputs
function colorizeSlider(color, hue, brightness, saturation){
    //Saturation scale
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat,color,fullSat]);

    //Brightness scale
    const midBr = color.set('hsl.l', 0.5)
    const scaleBr = chroma.scale(["black",midBr,"white"]);

    //Adding to the inputs
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBr(0)}, ${scaleBr(0.5)}, ${scaleBr(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75)`;

}

//Changing color of div
function hslControls(e){
    const index = e.target.getAttribute("data-hue")||
                  e.target.getAttribute("data-bright")||
                  e.target.getAttribute("data-sat");

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];


    const bgColor = initialColor[index];
    let color = chroma(bgColor)
                .set("hsl.l", brightness.value)
                .set("hsl.s", saturation.value)
                .set("hsl.h", hue.value);

    
    colorDivs[index].style.backgroundColor = color;

    //Colorize sliders
    colorizeSlider(color,hue,brightness,saturation);
    
}

//Changing of text and UI
function changeTextUI(index){
    //Get the div
    const activeDiv = colorDivs[index];
    //Get the color of div
    const color = chroma(activeDiv.style.backgroundColor);

    const text = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    text.innerText = color.hex();

    //Contrast 
    checkContrast(color, text);
    icons.forEach(icon=>{
        checkContrast(color, icon);
    })
    
}

//
function resetInputs(){
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider =>{
        if(slider.name === "hue"){
            const hueColor = initialColor[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }

        if(slider.name === "brightness"){
            const brightColor = initialColor[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue*100)/100;
        }

        if(slider.name === "saturation"){
            const satColor = initialColor[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue*100)/100;
        }
    })
}

function copyHex(hex){
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    //Animation
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
    
}

//Open/close settings box
function openBox(index){
    sliderBoxes[index].classList.toggle("active");
}

function closeBox(index){
    sliderBoxes[index].classList.remove("active");
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  }

//Staf for Local Storage
const saveBtn = document.querySelector(".save");
const saveCont = document.querySelector(".save-container");
const saveCloseBtn = document.querySelector(".close-save");
const savePaletteBtn = document.querySelector(".submit-save");

const libraryBtn = document.querySelector(".library");
const libraryCont = document.querySelector(".library-container");
const libraryCloseBtn = document.querySelector(".close-library");
//EventListeners

saveBtn.addEventListener("click",()=>{
    const popup = saveCont.children[0];
    saveCont.classList.add("active");
    popup.classList.add("active");
})

saveCloseBtn.addEventListener("click", ()=>{
    const popup = saveCont.children[0];
    saveCont.classList.remove("active");
    popup.classList.remove("active");
})

savePaletteBtn.addEventListener("click", ()=>{
    const popup = saveCont.children[0];

    const saveInput = document.querySelector(".save-name");
    const name = saveInput.value;
    const colors = [];
    hexTitlles.forEach(hex =>{
        colors.push(hex.innerText);
    })

    const palleteObj = {name, colors, nr: savedPalettes.length};
    savedPalettes.push(palleteObj);
    saveToLocale(palleteObj);
    addToLibrary(palleteObj);

    saveCont.classList.remove("active");
    popup.classList.remove("active");

    saveInput.value = "";
})


libraryBtn.addEventListener("click",()=>{
    const popup = libraryCont.children[0];
    libraryCont.classList.add("active");
    popup.classList.add("active");
})

libraryCloseBtn.addEventListener("click", ()=>{
    libraryClose();
})

function libraryClose(){
    const popup = libraryCont.children[0];
    libraryCont.classList.remove("active");
    popup.classList.remove("active");
}

//Save to Local Storage

function saveToLocale(paletteObj){
    let localPalettes;

    if(localStorage.getItem("palettes") === null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));

}

function addToLibrary(paletteObj){
    //Add to the library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
      const smallDiv = document.createElement("div");
      smallDiv.style.backgroundColor = smallColor;
      preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    //Event for Select button
    paletteBtn.addEventListener("click", (e)=>{
        libraryClose();
        const paletteIndex = e.target.classList[1];
        console.log(savedPalettes[paletteIndex]);
        initialColor = [];
        savedPalettes[paletteIndex].colors.forEach((color, index)=>{
            initialColor.push(color);
            colorDivs[index].style.background = color;
            const text = colorDivs[index].children[0];
            changeTextUI(index);
        })
        resetInputs();
        })
    //Push all elements to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryCont.children[0].appendChild(palette);
}


function getLocal(){
    if(localStorage.getItem("palettes") === null){
        savedPalettes = [];
    }else{
        savedPalettes = JSON.parse(localStorage.getItem("palettes"));
        savedPalettes.forEach(palleteObj =>{
            addToLibrary(palleteObj);
        })
    }
    
}

randomColors();
getLocal();



