function createAuthorElement(record) {
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
} 

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count && (info.current_page - 1) * info.per_page + 1;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        btn = createPageBtn(i, i == info.current_page ? ['active'] : []);
        buttonsContainer.append(btn);
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}
let currentPage = 1;
let currentQuery = '';
let currentPerPage = 10; // значение по умолчанию, можно задать любое другое по необходимости

function downloadData(page = currentPage, query = currentQuery, perPage = currentPerPage) {
    let factsList = document.querySelector('.facts-list');
    let urlLink = new URL(factsList.dataset.url);
    urlLink.searchParams.set('page', page);
    urlLink.searchParams.set('per-page', perPage);
    if (query) {
        urlLink.searchParams.set('q', query);
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', urlLink);
    xhr.responseType = 'json';
    xhr.onload = function() {
         renderRecords(this.response.records);
         setPaginationInfo(this.response['_pagination']);
         renderPaginationElement(this.response['_pagination']);
    };
    xhr.send();
    currentPage = page; // сохраняем текущую страницу
    currentQuery = query; // сохраняем текущий запрос поиска
    currentPerPage = perPage; // сохраняем текущее значение per-page
}

function perPageBtnHandler(event) {
    downloadData(1);
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function searchHandler(event) {
    event.preventDefault();
    let query = document.querySelector('.search-field').value;
    downloadData(1, query, currentPerPage); // передаем текущее значение per-page
}

function downloadAutocomplete(query) {
    const xhr = new XMLHttpRequest();
    const urlLink = 'http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete?q=' + query;
    xhr.open('GET', urlLink, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const autocompleteList = document.querySelector('.auto-complete-list');
            autocompleteList.innerHTML = '';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                autocompleteList.appendChild(option);
            });
        } else {
            console.error('Ошибка запросов:', xhr.statusText);
        }
    };
    xhr.onerror = function() {
        console.error('Ошибка');
    };

    xhr.send();
}

function autocmplHandler(event) {
    let query = event.target.value;
    downloadAutocomplete(query);
}

window.onload = function() {
    downloadData();
    document.querySelector('.search-btn').onclick = searchHandler;
    document.querySelector('.search-field').oninput = autocmplHandler;
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = function() {
        downloadData(1, currentQuery, this.value); // передаем текущий запрос и новое значение per-page
    };
};