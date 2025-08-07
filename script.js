// Todo App - Complete Implementation with Calendar and Categories
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            { id: 1, name: '회의', color: '#007bff' },
            { id: 2, name: '개발', color: '#28a745' },
            { id: 3, name: '프로젝트', color: '#dc3545' }
        ];
        this.currentFilter = 'all'; // all, active, completed
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.migrateOldTodos(); // 기존 할 일 데이터 마이그레이션
        this.init();
    }

    migrateOldTodos() {
        // 기존 할 일 데이터에 분류 정보가 없는 경우 기본 분류 할당
        this.todos.forEach(todo => {
            if (!todo.categoryId && !todo.categoryName && !todo.categoryColor) {
                // 기본 분류 중 하나를 랜덤하게 할당 (선택사항)
                const defaultCategory = this.categories[0]; // 첫 번째 분류 사용
                if (defaultCategory) {
                    todo.categoryId = defaultCategory.id;
                    todo.categoryName = defaultCategory.name;
                    todo.categoryColor = defaultCategory.color;
                }
            }
        });
        this.saveTodos(); // 마이그레이션된 데이터 저장
    }

    init() {
        this.renderTodos();
        this.setupEventListeners();
        this.renderCalendar();
        this.setupCalendarEventListeners();
        this.setDefaultDate();
        this.renderCategories();
        this.setupCategoryEventListeners();
        this.updateCategorySelect(); // 분류 선택 드롭다운 초기화 추가
    }

    setDefaultDate() {
        const todoDate = document.getElementById('todoDate');
        if (todoDate) {
            todoDate.value = this.formatDate(new Date());
        }
    }

    setupEventListeners() {
        // Add todo button
        const addButton = document.getElementById('addButton');
        if (addButton) {
            addButton.addEventListener('click', () => this.addTodo());
        }

        // Enter key in input
        const todoInput = document.getElementById('todoInput');
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo();
                }
            });
        }

        // Date picker
        const todoDate = document.getElementById('todoDate');
        if (todoDate) {
            todoDate.addEventListener('change', (e) => {
                this.selectedDate = new Date(e.target.value);
                this.renderTodos();
                this.renderCalendar();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clearCompleted');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        }
    }

    setupCategoryEventListeners() {
        // Category toggle
        const categoryToggle = document.getElementById('categoryToggle');
        const categoryContent = document.getElementById('categoryContent');
        
        if (categoryToggle && categoryContent) {
            categoryToggle.addEventListener('click', () => {
                categoryContent.classList.toggle('show');
                categoryToggle.textContent = categoryContent.classList.contains('show') ? '▲' : '▼';
            });
        }

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.addCategory());
        }

        // Category input enter key
        const categoryInput = document.getElementById('categoryInput');
        if (categoryInput) {
            categoryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addCategory();
                }
            });
        }
    }

    addCategory() {
        const categoryInput = document.getElementById('categoryInput');
        const categoryColor = document.getElementById('categoryColor');
        
        const name = categoryInput.value.trim();
        const color = categoryColor.value;
        
        if (name === '') return;
        
        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            alert('이미 존재하는 분류명입니다.');
            return;
        }

        const category = {
            id: Date.now(),
            name: name,
            color: color
        };

        this.categories.push(category);
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelect();
        
        categoryInput.value = '';
        categoryColor.value = '#007bff';
        categoryInput.focus();
    }

    editCategory(id) {
        const category = this.categories.find(cat => cat.id === id);
        if (!category) return;

        const newName = prompt('분류명을 입력하세요:', category.name);
        if (newName === null || newName.trim() === '') return;

        const trimmedName = newName.trim();
        if (this.categories.some(cat => cat.id !== id && cat.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert('이미 존재하는 분류명입니다.');
            return;
        }

        category.name = trimmedName;
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelect();
        this.renderTodos(); // Update todos with new category name
    }

    deleteCategory(id) {
        const category = this.categories.find(cat => cat.id === id);
        if (!category) return;

        const confirmDelete = confirm(`"${category.name}" 분류를 삭제하시겠습니까?\n이 분류의 할 일들은 분류가 제거됩니다.`);
        if (!confirmDelete) return;

        // Remove category from todos
        this.todos.forEach(todo => {
            if (todo.categoryId === id) {
                delete todo.categoryId;
                delete todo.categoryName;
                delete todo.categoryColor;
            }
        });

        // Remove category
        this.categories = this.categories.filter(cat => cat.id !== id);
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelect();
        this.renderTodos();
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.innerHTML = '';

        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.style.backgroundColor = category.color;
            
            categoryItem.innerHTML = `
                <span>${category.name}</span>
                <button class="edit-category" title="편집">✏️</button>
                <button class="delete-category" title="삭제">🗑️</button>
            `;

            const editBtn = categoryItem.querySelector('.edit-category');
            const deleteBtn = categoryItem.querySelector('.delete-category');

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editCategory(category.id);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCategory(category.id);
            });

            categoryList.appendChild(categoryItem);
        });
    }

    updateCategorySelect() {
        const categorySelect = document.getElementById('todoCategory');
        if (!categorySelect) return;

        // Keep the current selection
        const currentValue = categorySelect.value;
        
        categorySelect.innerHTML = '<option value="">분류 선택</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // Restore selection if it still exists
        if (currentValue && this.categories.some(cat => cat.id == currentValue)) {
            categorySelect.value = currentValue;
        }
    }

    setupCalendarEventListeners() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.changeMonth(-1));
        }
        
        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.changeMonth(1));
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarTitle = document.getElementById('calendarTitle');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!calendarTitle || !calendarDays) return;

        // Update calendar title
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                           '7월', '8월', '9월', '10월', '11월', '12월'];
        calendarTitle.textContent = `${year}년 ${monthNames[month]}`;

        // Clear calendar days
        calendarDays.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Create calendar grid
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            dayElement.textContent = currentDate.getDate();
            
            // Add classes based on date
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(currentDate)) {
                dayElement.classList.add('today');
            }
            
            if (this.isSelectedDate(currentDate)) {
                dayElement.classList.add('selected');
            }
            
            if (this.hasTodosForDate(currentDate)) {
                dayElement.classList.add('has-todos');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectDate(currentDate);
            });
            
            calendarDays.appendChild(dayElement);
        }
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isSelectedDate(date) {
        return date.getDate() === this.selectedDate.getDate() &&
               date.getMonth() === this.selectedDate.getMonth() &&
               date.getFullYear() === this.selectedDate.getFullYear();
    }

    hasTodosForDate(date) {
        const dateString = this.formatDate(date);
        return this.todos.some(todo => todo.date === dateString);
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        
        // Update date picker
        const todoDate = document.getElementById('todoDate');
        if (todoDate) {
            todoDate.value = this.formatDate(this.selectedDate);
        }
        
        this.renderCalendar();
        this.renderTodos();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const todoDate = document.getElementById('todoDate');
        const todoCategory = document.getElementById('todoCategory');
        const text = todoInput.value.trim();
        
        if (text === '') return;

        const selectedDate = todoDate.value || this.formatDate(this.selectedDate);
        const selectedCategoryId = todoCategory.value;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            date: selectedDate,
            createdAt: new Date().toISOString()
        };

        // Add category information if selected
        if (selectedCategoryId) {
            const category = this.categories.find(cat => cat.id == selectedCategoryId);
            if (category) {
                todo.categoryId = category.id;
                todo.categoryName = category.name;
                todo.categoryColor = category.color;
            }
        }

        this.todos.push(todo);
        this.saveTodos();
        this.renderTodos();
        this.renderCalendar();
        todoInput.value = '';
        // 분류 선택 초기화하지 않음 - 선택된 분류 유지
        todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.renderTodos();
        this.renderCalendar();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.renderCalendar();
        }
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
            this.renderCalendar();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.renderTodos();
    }

    updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.renderTodos();
        this.renderCalendar();
    }

    getFilteredTodos() {
        const selectedDateString = this.formatDate(this.selectedDate);
        let filteredTodos = this.todos.filter(todo => todo.date === selectedDateString);
        
        switch (this.currentFilter) {
            case 'active':
                return filteredTodos.filter(todo => !todo.completed);
            case 'completed':
                return filteredTodos.filter(todo => todo.completed);
            default:
                return filteredTodos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = this.getEmptyMessage();
            todoList.appendChild(emptyMessage);
            return;
        }

        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            todoList.appendChild(todoItem);
        });

        this.updateCounter();
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const todoDate = new Date(todo.date);
        const dateString = `${todoDate.getMonth() + 1}월 ${todoDate.getDate()}일`;

        let categoryHtml = '';
        if (todo.categoryName) {
            categoryHtml = `<span class="todo-category" style="background-color: ${todo.categoryColor}">${todo.categoryName}</span>`;
        }

        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-meta">
                    <span class="todo-date">📅 ${dateString}</span>
                    ${categoryHtml}
                </div>
                <input type="text" class="todo-edit-input" value="${this.escapeHtml(todo.text)}" style="display: none;">
            </div>
            <div class="todo-actions">
                <button class="edit-btn" title="편집">✏️</button>
                <button class="delete-btn" title="삭제">🗑️</button>
            </div>
        `;

        // Event listeners
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const todoText = li.querySelector('.todo-text');
        const editInput = li.querySelector('.todo-edit-input');

        editBtn.addEventListener('click', () => {
            todoText.style.display = 'none';
            editInput.style.display = 'inline-block';
            editInput.focus();
            editInput.select();
        });

        editInput.addEventListener('blur', () => {
            this.editTodo(todo.id, editInput.value);
        });

        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.editTodo(todo.id, editInput.value);
            }
        });

        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    updateCounter() {
        const selectedDateString = this.formatDate(this.selectedDate);
        const todosForDate = this.todos.filter(todo => todo.date === selectedDateString);
        const total = todosForDate.length;
        const completed = todosForDate.filter(todo => todo.completed).length;
        const active = total - completed;

        const counter = document.getElementById('todoCounter');
        if (counter) {
            const dateString = `${this.selectedDate.getMonth() + 1}월 ${this.selectedDate.getDate()}일`;
            counter.textContent = `${dateString} - 전체: ${total} | 완료: ${completed} | 진행중: ${active}`;
        }
    }

    getEmptyMessage() {
        const dateString = `${this.selectedDate.getMonth() + 1}월 ${this.selectedDate.getDate()}일`;
        switch (this.currentFilter) {
            case 'active':
                return `${dateString}에 진행중인 할 일이 없습니다.`;
            case 'completed':
                return `${dateString}에 완료된 할 일이 없습니다.`;
            default:
                return `${dateString}에 할 일을 추가해보세요!`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Utility functions for global access
function addTodo() {
    const app = window.todoApp || new TodoApp();
    app.addTodo();
}

function setFilter(filter) {
    const app = window.todoApp || new TodoApp();
    app.setFilter(filter);
}

function clearCompleted() {
    const app = window.todoApp || new TodoApp();
    app.clearCompleted();
}
