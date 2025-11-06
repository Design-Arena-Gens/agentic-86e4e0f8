(function () {
  const STORAGE_KEY = 'books.v1';
  /** @type {HTMLFormElement} */
  const form = document.getElementById('book-form');
  const listEl = document.getElementById('book-list');
  const emptyEl = document.getElementById('empty');
  const clearAllBtn = document.getElementById('clear-all');
  const resetBtn = document.getElementById('reset-button');
  const toastEl = document.getElementById('toast');

  /** @typedef {{ id: string, title: string, author?: string, year?: number, isbn?: string, description?: string, createdAt: number }} Book */

  function loadBooks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  /** @param {Book[]} books */
  function saveBooks(books) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1600);
  }
  function render() {
    const books = loadBooks();
    listEl.innerHTML = '';
    if (!books.length) {
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    for (const book of books) {
      const li = document.createElement('li');
      li.className = 'book-item';
      const title = document.createElement('h3');
      title.className = 'book-title';
      title.textContent = book.title;
      const meta = document.createElement('p');
      meta.className = 'book-meta';
      const metaParts = [];
      if (book.author) metaParts.push(book.author);
      if (book.year) metaParts.push(String(book.year));
      if (book.isbn) metaParts.push(`#${book.isbn}`);
      meta.textContent = metaParts.join(' ? ');
      const desc = document.createElement('p');
      if (book.description) desc.textContent = book.description;
      const actions = document.createElement('div');
      actions.className = 'book-actions';
      const del = document.createElement('button');
      del.className = 'danger small';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        const next = loadBooks().filter(b => b.id !== book.id);
        saveBooks(next);
        render();
        showToast('Book deleted');
      });
      actions.appendChild(del);
      li.appendChild(title);
      if (metaParts.length) li.appendChild(meta);
      if (book.description) li.appendChild(desc);
      li.appendChild(actions);
      listEl.appendChild(li);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const author = String(data.get('author') || '').trim();
    const yearStr = String(data.get('year') || '').trim();
    const isbn = String(data.get('isbn') || '').trim();
    const description = String(data.get('description') || '').trim();

    if (!title) { showToast('Title is required'); return; }
    const year = yearStr ? Number(yearStr) : undefined;

    /** @type {Book} */
    const book = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      title, author: author || undefined, year: isFinite(year) ? year : undefined,
      isbn: isbn || undefined, description: description || undefined,
      createdAt: Date.now(),
    };

    const books = loadBooks();
    books.unshift(book);
    saveBooks(books);
    form.reset();
    render();
    showToast('Book created');
    // return focus to title for quick entry
    const titleEl = document.getElementById('title');
    if (titleEl) titleEl.focus();
  });

  resetBtn.addEventListener('click', () => {
    showToast('Form cleared');
  });

  clearAllBtn.addEventListener('click', () => {
    const books = loadBooks();
    if (!books.length) return;
    if (!confirm('Remove all books?')) return;
    saveBooks([]);
    render();
    showToast('All books cleared');
  });

  // Initial paint
  render();
})();
