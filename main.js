document.querySelector("html").addEventListener("click", function() {
    alert("pourquoi tu clique ?? Nan je rigole, allez bonne lecture !!");
});
let myImage = document.querySelector("img");

myImage.addEventListener("click",function () {
    let mySrc = myImage.getAttribute("src");
    if (mySrc === "images/mont.png") {
      myImage.setAttribute("src", "images/paris.png");
} else {
    myImage.setAttribute("src", "images/mont.png");
  }
});
let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");
function setUserName() {
    let myName = prompt("veuillez saisir votre nom.");
    localStorage.setItem("nom",myName);
    myHeading.textContent = "Google est cool, " + myName;
}
if (!localStorage.getItem("nom")) {
    setUserName();
} else {
    let storedName = localStorage.getItem("nom");
    myHeading.textHeading.textContent = "Google est cool, " + storedName
}
myButton.addEventListener("click", function () { setUserName();
});