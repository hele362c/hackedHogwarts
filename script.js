"use strict";
window.addEventListener("DOMContentLoaded", start);

let studentListUrl = "https://petlatkea.dk/2021/hogwarts/students.json";
let familyListUrl = "https://petlatkea.dk/2021/hogwarts/families.json";
let allStudents = [];
let filteredStudents = allStudents;

const detail = document.querySelector("#popup");
const detailTemplate = document.querySelector("#details");

let numberOfStudents = document.querySelector(".number");
let theSystemIsHacked = false;

const Student = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  gender: "",
  house: "",
  image: "",
  bloodStatus: "",
  expelled: false,
  prefect: false,
  squad: false,
};

//global variabler
const settings = {
  filter: "all",
  sortBy: "firstName",
  sortDir: "asc",
};

let bloodStatusList;

function start() {
  console.log("start");
  //loadJSON("https://petlatkea.dk/2021/hogwarts/students.json");
  document.querySelector(".search").addEventListener("input", searchStudent);
  registerButtons();
  loadJSON();
}

function registerButtons() {
  //opretter en klik funktion for hver en knap til filtering.
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  //opretter en klik funktion for hver en knap til sorting.
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));

  document.querySelector(".hack").addEventListener("click", hackTheSystem);
}

// async function loadJSON(url) {
//   console.log("loadJSON");
//   const response = await fetch(url);
//   const jsonData = await response.json();
//   // Når siden loades forbedres JSON data.
//   prepareObject(jsonData);
// }

async function loadJSON() {
  await Promise.all([fetch(studentListUrl).then((res) => res.json()), fetch(familyListUrl).then((res) => res.json())]).then((jsonData) => {
    // When loaded, prepare data objects
    prepareObject(jsonData[0], jsonData[1]);
  });
}

// function prepareObject(jsonData) {
//   console.log(jsonData);
//   allStudents = jsonData.map(prepareObject);

//   displayList(allStudents);
// }

// Prepare data objects
function prepareObject(students, bloodStatus) {
  students.forEach((element) => {
    const student = Object.create(Student);

    student.firstName = takeFirstName(element.fullname);
    student.lastName = takeLastName(element.fullname);
    student.middleName = takeMidddelName(element.fullname);
    student.nickName = takeNickName(element.fullname);
    student.image = takeImage(student.firstName, student.lastName);
    student.house = takeHouse(element.house);
    student.gender = takeGender(element.gender);
    student.bloodStatus = takeBloodStatus(student.lastName, bloodStatus);
    allStudents.push(student);
    //displayList(allStudents);
    //numberOfStudents.textContent = `Students: ${allStudents.length}`;
  });

  buildList();
  // numberOfStudents.textContent = `Students: ${allStudents.length}`;
  // console.log(`Hvis antal studerende ${allStudents.length}`);
}

function takeBloodStatus(lastName, bloodStatus) {
  if (bloodStatus.half.includes(lastName)) {
    bloodStatus = "Half-blood";
  } else if (bloodStatus.pure.includes(lastName)) {
    bloodStatus = "Pure-blood";
  } else {
    bloodStatus = "Muggle-born";
  }
  return bloodStatus;
}

function takeHouse(house) {
  //console.log("takeHouse");
  house = house.trim();
  //sætter første bogstav i "house" med stort.
  house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();
  return house;
}

function takeGender(gender) {
  //console.log("takeGender");
  gender = gender.trim();
  //sætter første bogstav i "gender" med stort.
  gender = gender.substring(0, 1).toUpperCase() + gender.substring(1).toLowerCase();
  return gender;
}
function takeFirstName(fullname) {
  //console.log("takeFirstName");
  let firstName = fullname.trim();
  //sætter navnet før første mellemrum til at være "firstName"
  if (fullname.includes(" ")) {
    firstName = firstName.substring(0, firstName.indexOf(" "));
    //sætter første bogstav i "first" med stort.
    firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();
  } else {
    //hvis der er mellemrum efter "firstName" skal det fjernes.
    firstName = firstName;
  }
  return firstName;
}

function takeLastName(fullname) {
  //console.log("takeLastName");
  let lastName = fullname.trim();
  lastName = lastName.substring(lastName.lastIndexOf(" ") + 1);
  lastName = lastName.substring(0, 1).toUpperCase() + lastName.substring(1).toLowerCase();
  // navne efter "-" skal starte med stort
  if (fullname.includes("-")) {
    let lastNames = lastName.split("-");
    lastNames[1] = lastNames[1].substring(0, 1).toUpperCase() + lastNames[1].substring(1).toLowerCase();
    lastName = lastNames.join("-");
  }
  return lastName;
}

function takeMidddelName(fullname) {
  //console.log("takeMidddelName");
  let middleName = fullname.trim();
  middleName = middleName.split(" ");
  // hvis der er "", skal mellemnavn sættets til nul
  if (fullname.includes(' "')) {
    middleName = "";
  } else if (middleName.length > 2) {
    //er der mere end to navne skal nr. 2 blive til mellemnavn
    middleName = middleName[1];
    middleName = middleName.substring(0, 1).toUpperCase() + middleName.substring(1).toLowerCase();
  } else {
    middleName = "";
  }
  return middleName;
}

function takeNickName(fullname) {
  //console.log("takeNickName");
  let nickName = fullname.trim();
  nickName = nickName.split(" ");
  // hvis der skrives et navn inde i "" skal det gøres til kældenavn.
  if (fullname.includes(' "')) {
    nickName = nickName[1];
  } else {
    nickName = "";
  }
  return nickName;
}

function takeImage(firstName, lastName) {
  let image;

  if (lastName === "Patil") {
    image = `./images/${lastName.toLowerCase()}_${firstName.toLowerCase()}.png`;
  } else if (firstName === "Leanne") {
    //hvis photo på den uden billede
    image = `./images/nonphoto.png`;
  } else if (firstName === "Justin") {
    lastName = lastName.split("-");
    image = `./images/${lastName[1].toLowerCase()}_${firstName.substring(0, 1).toLowerCase()}.png`;
  } else {
    image = `./images/${lastName.toLowerCase()}_${firstName.substring(0, 1).toLowerCase()}.png`;
  }
  return image;
}

function selectFilter(event) {
  //gør det muligt at klikke på knapperne og filtrer.
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  //filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  //let filteredList = allStudents;
  //lav en filtrerings liste for de forskellige huse.
  if (settings.filterBy === "slytherin") {
    filteredList = filteredStudents.filter(isSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = filteredStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = filteredStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "gryffindor") {
    filteredList = filteredStudents.filter(isGryffindor);
  } else if (settings.filterBy === "expelled") {
    filteredList = allStudents.filter(isExpelled);
  } else if (settings.filterBy === "prefect") {
    filteredList = filteredStudents.filter(isPrefect);
  } else if (settings.filterBy === "squad") {
    filteredList = filteredStudents.filter(isSquad);
  }
  return filteredList;
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}
function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}
function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}
function isGryffindor(student) {
  return student.house === "Gryffindor";
}
function isExpelled(student) {
  return student.expelled === true;
}
function isPrefect(student) {
  return student.prefect === true;
}
function isSquad(student) {
  return student.squad === true;
}

function selectSort(event) {
  //gør det muligt at klikke på knapperne og filtrer.
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //her kan vi sifte frem og tilbage from sorting til ikke sorting.
  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`user selected ${settings.sortBy}- ${settings.sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // let sortedList = allStudents;
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByPropperty);

  //sorter udfra fornavn, efternavn og huse
  function sortByPropperty(studentA, studentB) {
    // console.log(`sortBy is ${settings.sortBy}`);
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  filteredStudents = allStudents.filter((student) => student.expelled === false);
  const currentList = filterList(filteredStudents);
  const sortedList = sortList(currentList);

  displayList(currentList);
}

function displayList(students) {
  // ryd liste
  document.querySelector("#studentlist").innerHTML = "";
  // lav en ny liste
  students.forEach(displayStudent);
  //viser antal studerne under de forskellige filteringer.
  document.querySelector(".number").textContent = `Number of students: ${students.length}`;
}

function displayStudent(student) {
  // opretter en Klon
  const clone = document.querySelector("#template").content.cloneNode(true);

  //henter article
  //const article = clone.querySelector("[data-field=article]");

  // indsætter den clonet data in i article
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=name]").textContent = `${student.firstName} ${student.lastName}`;
  clone.querySelector("[data-field=img]").src = student.image;
  clone.querySelector(".readMore").addEventListener("click", () => showDetails(student));

  clone.querySelector("[data-field=expell]").addEventListener("click", clickOnExpell);

  if (student.expelled === true) {
    clone.querySelector(".expell").classList.remove(".hide");
  } else if (student.expelled === false) {
    clone.querySelector(".expell").classList.add(".hide");
  }
  numberOfStudents.textContent = `Students: ${filteredStudents.length}`;

  function clickOnExpell() {
    console.log("clickOnExpell");
    if (student.firstName === "Helena") {
      student.expelled === false;
      //Helena kan ikke blive expelled.
      canTExpell();
    } else {
      student.expelled = !student.expelled;
    }

    buildList();
    // (student.expelled === false) {
    //   student.expelled = true;
    //   console.log("den studerende bliver expelled");
    // }
  }

  //---------------Prefects-----------------------
  // kalder funktionen click på prefect
  clone.querySelector(".prefect").addEventListener("click", clickPrefect);

  if (student.prefect === true) {
    clone.querySelector(".prefect").classList.remove("gray");
  } else if (student.squad === false) {
    clone.querySelector(".prefect").classList.add("gray");
  }

  //prefect true eller false på click
  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
    numberOfStudents.textContent = `Students: ${allStudents.length}`;
    buildList();
  }
  // ændre farven på prefect (aktiv og ikke aktiv)
  // if (student.prefect === true) {
  //   clone.querySelector(".prefect").classList.remove("gray");
  // } else if (student.prefect === false) {
  //   clone.querySelector(".prefect").classList.add("gray");
  // }

  //---------------SQUAD-----------------------
  clone.querySelector(".InquisSquad").addEventListener("click", clickSquad);

  if (student.squad === true) {
    clone.querySelector(".InquisSquad").classList.remove("gray");
  } else if (student.squad === false) {
    clone.querySelector(".InquisSquad").classList.add("gray");
  }

  function clickSquad() {
    if (theSystemIsHacked === true) {
      student.squad = true;
      temporarilySquad();
    } else if (student.house === "Slytherin" || student.bloodStatus === "Pure-blood") {
      student.squad = !student.squad;
    } else {
      canTBeSquad();
    }
    buildList();
  }

  // function clickSquad() {
  //   if (student.house === "Slytherin" || student.bloodStatus === "Pure-blood") {
  //     student.squad = !student.squad;
  //   } else {
  //     canTBeSquad();
  //   }
  //   buildList();
  // }

  // insdætter det i studentlist så det kan vises i DOM'en.
  document.querySelector("#studentlist").appendChild(clone);
}

function tryToMakePrefect(selectedStudent) {
  const prefects = filteredStudents.filter((student) => student.prefect);

  const other = prefects.filter((student) => student.house === selectedStudent.house);
  const numberOfPrefects = other.length;

  // der må ikke være mere end to for samme hus som er prefect.
  //hvis der er to andre "other" fra samme hus.
  console.log(`There are ${numberOfPrefects} prefects`);
  if (numberOfPrefects >= 2) {
    removeAorB(other[0], other[1]);
  } else {
    makePrefect(selectedStudent);
  }
  //console.log(`the other prefect of this house is ${other.firstName}`);
  function removeAorB(prefectA, prefectB) {
    // Ask user to igore or remove a or b
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    // Show names on buttons
    document.querySelector("#remove_aorb [data-field=prefectA]").textContent = `${prefectA.firstName} ${prefectA.lastName}`;
    document.querySelector("#remove_aorb [data-field=prefectB]").textContent = `${prefectB.firstName} ${prefectB.lastName}`;

    // If ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      // If removeA
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }

    function clickRemoveB() {
      // If removeB
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(studentPrefect) {
    studentPrefect.prefect = false;
  }

  function makePrefect(student) {
    student.prefect = true;
  }
}
//--------------pop up til "can not be squad" Squad--------
function canTBeSquad() {
  // Show modal
  document.querySelector("#cantBeSquad").classList.remove("hide");
  document.querySelector("#cantBeSquad .closebutton").addEventListener("click", closeDialog);

  // Close modal
  function closeDialog() {
    document.querySelector("#cantBeSquad").classList.add("hide");
    document.querySelector("#cantBeSquad .closebutton").removeEventListener("click", closeDialog);
  }
}

function canTExpell() {
  // Show modal
  document.querySelector("#canTExpell").classList.remove("hide");
  document.querySelector("#canTExpell .closebutton").addEventListener("click", closeDialog);

  // Close modal
  function closeDialog() {
    document.querySelector("#canTExpell").classList.add("hide");
    document.querySelector("#canTExpell .closebutton").removeEventListener("click", closeDialog);
  }
}
function searchStudent() {
  const searchValue = document.querySelector(".search").value;

  const search = allStudents.filter((element) => element.firstName.toUpperCase().includes(searchValue.toUpperCase()) || element.firstName.toLowerCase().includes(searchValue.toLowerCase()));

  numberOfStudents.textContent = `Students: ${search.length}`;
  displayList(search);
}

//---------------POP-UP---------------
function showDetails(student) {
  console.log("details clicked");
  const clone = detailTemplate.cloneNode(true).content;
  detail.textContent = "";
  clone.querySelector("[data-field=detailimg]").src = student.image;
  clone.querySelector(".firstName").textContent = `Firstname: ${student.firstName}`;
  clone.querySelector(".middleName").textContent = `Middelname: ${student.middleName}`;
  clone.querySelector(".nickName").textContent = `Nickname: ${student.nickName}`;
  clone.querySelector(".lastName").textContent = `Lastname: ${student.lastName}`;
  clone.querySelector(".bloodStatus").textContent = `Blood status: ${student.bloodStatus}`;
  clone.querySelector(".gender").textContent = `Gender: ${student.gender}`;
  clone.querySelector(".house").textContent = `House: ${student.house}`;
  if (student.squad === true) {
    clone.querySelector(".ISquad").textContent = `Inquisitorial squad: Yes`;
  } else {
    clone.querySelector(".ISquad").textContent = `Inquisitorial squad: No`;
  }
  if (student.prefect === true) {
    clone.querySelector(".prefectet").textContent = `Prefect: Yes`;
  } else {
    clone.querySelector(".prefectet").textContent = `Prefect: No`;
  }
  if (student.expelled === true) {
    clone.querySelector(".exp").textContent = `Prefect: Yes`;
  } else {
    clone.querySelector(".exp").textContent = `Prefect: No`;
  }

  if (student.house === "Gryffindor") {
    detail.style.background = "#650000";
    clone.querySelector(".housecrest").style.backgroundImage = "url('./images/gryffindor.png')";
  } else if (student.house === "Hufflepuff") {
    detail.style.background = "#FF9D1D";
    clone.querySelector(".housecrest").style.backgroundImage = "url('./images/hufflepuff.png')";
  } else if (student.house === "Slytherin") {
    detail.style.background = "#2E751D";
    clone.querySelector(".housecrest").style.backgroundImage = "url('./images/slytherin.png')";
  } else {
    detail.style.background = "#8F501E";
    clone.querySelector(".housecrest").style.backgroundImage = "url('./images/ravenclaw.png')";
  }

  clone.querySelector("#close").addEventListener("click", closeDetails);
  detail.classList.add("active");
  detail.appendChild(clone);
}

function closeDetails() {
  console.log("Details closed");
  detail.classList.remove("active");
}

function hackTheSystem() {
  theSystemIsHacked = true;
  document.querySelector(".hack").removeEventListener("click", hackTheSystem);
  console.log("The system is hacked", theSystemIsHacked);

  injectMe();

  hackBlood();

  temporarilySquad();
}
function injectMe() {
  const mySelf = {
    firstName: "Helena",
    middleName: "Hoffmeyer",
    lastName: "Jakobsen",
    nickName: "Helen",
    gender: "Girl",
    house: "Gryffindor",
    image: "./images/hacker.png",
    bloodStatus: "pure-blood",
    expelled: false,
    prefect: false,
    squad: false,
  };
  allStudents.push(mySelf);
  numberOfStudents.textContent = `Students: ${filteredStudents.length}`;
  buildList();
}

function hackBlood() {
  console.log("hackBlood");
  const bloodStatuses = [true, false];

  allStudents.forEach((student) => {
    if ((student.bloodStatus = "Pure-blood" & !student.hacker)) {
      student.bloodStatus = bloodStatuses[Math.floor(Math.random() * 2)];
    } else {
      student.bloodStatus = "Muggle-born";
    }
  });
  displayList(allStudents);
}

function temporarilySquad() {
  console.log("Limit time on squad");
  allStudents.forEach((student) => {
    if (student.squad === true) {
      console.log("student is squad");
      setTimeout(() => {
        student.squad = false;
        buildList();
      }, 5000);
    }
  });
}
