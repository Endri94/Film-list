

// Находим элементы формы и кнопки
const filmForm = document.querySelector("#film-form");
const title = document.querySelector("#title");
const genre = document.querySelector("#genre");
const releaseYear = document.querySelector("#releaseYear");
const isWatched = document.querySelector("#isWatched");
const submitBtn = document.querySelector("#submitButton");
const cancelBtn = document.querySelector("#cancelButton");
// Находим селект сортировки
const sortSelect = document.querySelector("#sorting");
const sortBtn = document.querySelector("#sortBtn");
const sortDirectionIndicator = document.querySelector("#sortDirectionIndicator");
// находим блоки инпутов для появления текста ошибки
const nameBlock = document.querySelector(".name-block");
const genreBlock = document.querySelector(".genre-block");
const releaseBlock = document.querySelector(".release-block");
// создаем ошибку под полями ввода
const titleErrorMessage = document.createElement("span");
const genreErrorMessage = document.createElement("span");
const releaseErrorMessage = document.createElement("span");
// добавляем класс к текстам ошибки
titleErrorMessage.classList.add("error-message");
genreErrorMessage.classList.add("error-message");
releaseErrorMessage.classList.add("error-message");

const currentDate = new Date().getFullYear();

// переменная для редактирования фильма, найти по ID
let editingFilmId = null;

// функция присвоения значений из полей формы к объекту (film)
function handleFormSubmit() {

    const filmData = {
        id: editingFilmId || getId(),
        title: title.value.trim(),
        genre: genre.value.trim(),
        releaseYear: releaseYear.value,
        isWatched: isWatched.checked
    };

    if (editingFilmId) {
        updateFilmInLocalStorage(filmData);
        editingFilmId = null;
        submitBtn.textContent = "Добавить";
        cancelBtn.style.display = "none";
    } else {
        addFilmToLocalStorage(filmData);
    }
    filmForm.reset();
}

// достаем значения фильма в поля формы
function loadFilmDataForEditing(film) {
    title.value = film.title;
    genre.value = film.genre;
    releaseYear.value = film.releaseYear;
    isWatched.checked = film.isWatched;
    editingFilmId = film.id;
    submitBtn.textContent = "Сохранить";
    cancelBtn.style.display = "inline-block";
}

// вешаем слушаетль на кнопку отмены редактирования и обнуляем поля формы
cancelBtn.addEventListener("click", () => {
    filmForm.reset();
    editingFilmId = null;
    submitBtn.textContent = "Добавить";
    cancelBtn.style.display = "none";
    //Удаляем ошибки валидации если таковые имеются
    title.classList.remove("error");
    genre.classList.remove("error");
    releaseYear.classList.remove("error");
    if (nameBlock.contains(titleErrorMessage)) titleErrorMessage.remove();
    if (genreBlock.contains(genreErrorMessage)) genreErrorMessage.remove();
    if (releaseBlock.contains(releaseErrorMessage)) releaseErrorMessage.remove();
});

// создаем ID для элементов списка чтобы в дальнейшем взаимодействовать с ними
function getId(length = 16) {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < length; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
}
let randomId = getId();

// корректный ввод в поле инпут
title.addEventListener('input', function (e) {
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)
})
genre.addEventListener('input', function (e) {
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)
})

// функция добавления фильма в localStorage
function addFilmToLocalStorage(film) {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    films.push(film)
    localStorage.setItem('films', JSON.stringify(films));
    renderTable();
}

// Обновляем фильм в localStorage
function updateFilmInLocalStorage(updatedFilm) {
    const films = JSON.parse(localStorage.getItem("films")) || [];
    const filmIndex = films.findIndex((film) => film.id === updatedFilm.id);
    if (filmIndex !== -1) {
        films[filmIndex] = updatedFilm;
        localStorage.setItem("films", JSON.stringify(films));
        renderTable();
    }
}

// функция отрисовки фильмов в таблице 
function renderTable() {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    const filmTableBody = document.querySelector('#film-tbody')

    filmTableBody.innerHTML = ''

    films.forEach((film) => {
        const row = document.createElement('tr')
        row.classList.add('table-dark')
        row.innerHTML =
            `
        <td class="table-dark">${film.title}</td>
        <td class="table-dark">${film.genre}</td>
        <td class="table-dark">${film.releaseYear}</td>
        <td class="table-dark">${film.isWatched ? 'Да' : 'Нет'}</td>
            <td>
             <div class="film-actions">
             <button id="edit" class="btn btn-secondary edit-btn"data-id="${film.id
            }">Редактировать</button>
             <button id="delete" class="btn btn-danger delete-btn"data-id="${film.id
            }">Удалить</button>
             </div>
            </td>
            `
        filmTableBody.append(row)
        // очищаем поля ввода после добавления
        // title.value = ''
        // genre.value = ''
        // releaseYear.value = ''
        filmForm.reset()
    })
    // вызываем функции слушателей для кнопки редактирования и кнопки удаления
    addEditEventListeners();
    deleteEventListener();
}

// вывод значений селекта
const sortOrders = {
    title: "asc",
    genre: "asc",
    year: "asc"
};

// стрелка направления сортировки для наглядности
function updateSortIndicator(sortBy) {
    const arrow = sortOrders[sortBy] === "asc" ? "↑" : "↓"; // Added line for indicator
    sortDirectionIndicator.textContent = arrow;
}
// сортировка и отрисовка
function sortAndRender() {
    let films = JSON.parse(localStorage.getItem("films")) || [];
    const sortBy = sortSelect.value;
    const order = sortOrders[sortBy];

    if (sortBy === "title") {
        films.sort((a, b) => order === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    } else if (sortBy === "genre") {
        films.sort((a, b) => order === "asc" ? a.genre.localeCompare(b.genre) : b.genre.localeCompare(a.genre));
    } else if (sortBy === "year") {
        films.sort((a, b) => order === "asc" ? a.releaseYear - b.releaseYear : b.releaseYear - a.releaseYear);
    }

    // клик кнопки для изменения направления
    sortOrders[sortBy] = order === "asc" ? "desc" : "asc";
    localStorage.setItem("films", JSON.stringify(films));
    updateSortIndicator(sortBy);
    renderTable();
}
// вешаем слушатель на кнопку сортировки и в нем же вызываем функцию для сортировки
sortBtn.addEventListener('click', sortAndRender);

// функция валидации полей ввода
function isValidate() {

    let success = true;

    if (title.value.trim() == '') {
        title.classList.add('error')
        titleErrorMessage.textContent = 'Введите название фильма'
        nameBlock.appendChild(titleErrorMessage)
        success = false
    } else {
        title.classList.remove('error')
        titleErrorMessage.remove()
    }

    if (genre.value.trim() == '') {
        genre.classList.add('error')
        genreErrorMessage.textContent = 'Введите жанр фильма'
        genreBlock.appendChild(genreErrorMessage)
        success = false
    } else {
        genre.classList.remove('error')
        genreErrorMessage.remove()
    }

    if (releaseYear.value == '' || releaseYear.value < 1895 || releaseYear.value > currentDate) {
        releaseYear.classList.add('error')
        releaseErrorMessage.textContent = `Введите год выпуска фильма. Диапазон ввода: 1895 - ${currentDate}`
        releaseBlock.appendChild(releaseErrorMessage)
        success = false
    } else {
        releaseYear.classList.remove('error')
        releaseErrorMessage.remove()
    }

    return success
}

// функция редактирования (потом ее надо вызвать в отрисовке таблицы)
function addEditEventListeners() {
    const editBtns = document.querySelectorAll(".edit-btn");
    editBtns.forEach((btn) => {
        btn.addEventListener("click", function (event) {
            const id = event.target.dataset.id;
            const films = JSON.parse(localStorage.getItem("films")) || [];
            const filmToEdit = films.find((film) => film.id === id);
            if (filmToEdit) {
                loadFilmDataForEditing(filmToEdit);
            }
        });
    });
}

// функция удаления (потом ее надо вызвать в отрисовке таблицы)
function deleteEventListener() {
    const deleteBtn = document.querySelectorAll("#delete"); // Ищем по id. id должно быть уникальным
    deleteBtn.forEach(function (el) {
        el.addEventListener("click", function (event) {
            const films = JSON.parse(localStorage.getItem("films")) || [];
            const confirmDelete = confirm('Вы точно хотите удалить фильм?')
            let id = event.target.dataset.id; // Берем id
            if (confirmDelete === true) {
                let filmIndex = films.findIndex(film => film.id == id); // Ищем индекс элеменда в списке
                if (filmIndex === -1) return; // Проверяем если индекс не равен -1 , значит такого элемента нету и ничего не произойдет
                films.splice(filmIndex, 1); // Удаляем из списка
                localStorage.setItem('films', JSON.stringify(films)); // перезаписываем localStorage
                renderTable() // Удаление динамически через отрисовку без перезагрузки страницы
            } else {
                return
            }
        });

    });
}

// слушатель события на форму с проверками 
filmForm.addEventListener('submit', function (e) {
    e.preventDefault()

    // если валидация полей === true то произойдет добавление в таблицу и перерисовка таблицы
    if (isValidate() === true) {
        handleFormSubmit()
        renderTable()
        // делаю перезагрузку для присвоения уникального id без повторений
        location.reload()
    }
})

// отрисовка таблицы при запуске страницы
renderTable()