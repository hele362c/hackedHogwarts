"use strict";
window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const detail = document.querySelector("#popup");
const detailTemplate = document.querySelector("#details");

let numberOfStudents = document.querySelector(".studentNumber");

const Student = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  gender: "",
  house: "",
  image: "",
};
//global variabler
const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  // getButtons();
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json");

  document.querySelector(".search").addEventListener("input", searchStudent);
  registerButtons();
}

function registerButtons() {
  //opretter en klik funktion for hver en knap til filtering.
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  //opretter en klik funktion for hver en knap til sorting.
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON(url) {
  console.log("loadJSON");
  const response = await fetch(url);
  const jsonData = await response.json();
  // Når siden loades forbedres JSON data.
  prepareObject(jsonData);
}

function prepareObject(jsonData) {
  console.log(jsonData);
  allStudents = jsonData.map(prepareObject);

  numberOfStudents.textContent = `Students: ${filteredStudents.length}`;
  displayList(allStudents);
}

// Prepare data objects
function prepareObject(student) {
  student.forEach((element) => {
    const student = Object.create(Student);

    student.firstName = takeFirstName(element.fullname);
    student.lastName = takeLastName(element.fullname);
    student.middleName = takeMidddelName(element.fullname);
    student.nickName = takeNickName(element.fullname);
    student.image = takeImage(student.firstName, student.lastName);
    student.house = takeHouse(element.house);
    student.gender = takeGender(element.gender);
    allStudents.push(student);
  });
  buildList();
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
  // create a filter list for the different houses.
  if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  }
  //TODO - HUSK LAV FILTERING FOR Exceplled.

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
    console.log(`sortBy is ${settings.sortBy}`);
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(students) {
  // ryd liste
  document.querySelector("#studentlist").innerHTML = "";

  // lav en ny liste
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // opretter en Klon
  const clone = document.querySelector("#template").content.cloneNode(true);

  //henter article
  const article = clone.querySelector("[data-field=article]");

  // indsætter den clonet data in i article
  const random = Math.floor(Math.random() * allStudents.length);
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=name]").textContent = `${student.firstName} ${student.lastName}`;
  clone.querySelector("[data-field=img]").src = student.image;
  clone.querySelector(".readMore").addEventListener("click", () => showDetails(student));
  // insætter det i studentlist så det kan vises i DOM'en.
  document.querySelector("#studentlist").appendChild(clone);
}

function searchStudent() {
  //get the value from the input
  const searchValue = document.querySelector(".search").value;
  //filter through the students and find student based on search value
  const search = allStudents.filter((element) => element.name.toUpperCase().includes(searchValue.toUpperCase()) || element.name.toLowerCase().includes(searchValue.toLowerCase()));
  //show how many students got filtered
  numberOfStudents.textContent = `Students: ${search.length}`;
  displayList(search);
}

function showDetails(student) {
  console.log("details clicked");
  const clone = detailTemplate.cloneNode(true).content;
  detail.textContent = "";
  clone.querySelector("[data-field=detailimg]").src = student.image;
  clone.querySelector(".firstName").textContent = `Firstname: ${student.firstName}`;
  clone.querySelector(".middleName").textContent = `Middelname: ${student.middleName}`;
  clone.querySelector(".nickName").textContent = `Nickname: ${student.nickName}`;
  clone.querySelector(".lastName").textContent = `Lastname: ${student.lastName}`;
  //clone.querySelector("[data-field=bloodstatus]").textContent = `Blood status: ${student.bloodStatus}`;
  clone.querySelector(".gender").textContent = `Gender: ${student.gender}`;
  clone.querySelector(".house").textContent = `House: ${student.house}`;

  //
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
