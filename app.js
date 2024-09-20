// LinksManager class to manage the links
var LinksManager = /** @class */ (function () {
    // Constructor to initialize the LinksManager
    function LinksManager() {
        this.links = [];
        this.STORAGE_KEY = 'links-manager';
        this.editingLinkId = null;
        this.currentPage = 1;
        this.LINKS_PER_PAGE = 20;
        this.loadLinks();
        this.setupEventListeners();
        this.renderLinks();
    }
    // Load the links from local storage
    LinksManager.prototype.loadLinks = function () {
        var storedLinks = localStorage.getItem(this.STORAGE_KEY);
        if (storedLinks) {
            this.links = JSON.parse(storedLinks);
        }
    };
    // Setup event listeners
    LinksManager.prototype.setupEventListeners = function () {
        var _this = this;
        var form = document.querySelector('#urlLinksForm');
        form.addEventListener('submit', this.handleAddLinkSubmit.bind(this));
        var linksList = document.querySelector('#linksList');
        linksList.addEventListener('click', this.handleLinkActions.bind(this));
        var editLinkForm = document.querySelector('#editLinkForm');
        editLinkForm.addEventListener('submit', this.handleEditLinkSubmit.bind(this));
        var cancelEditLink = document.querySelector('#cancelEditLink');
        cancelEditLink.addEventListener('click', this.closeEditDialog.bind(this));
        var confirmDeleteLink = document.querySelector('#confirmDeleteLink');
        confirmDeleteLink.addEventListener('click', this.handleDeleteConfirm.bind(this));
        var cancelDeleteLink = document.querySelector('#cancelDeleteLink');
        cancelDeleteLink.addEventListener('click', this.closeDeleteDialog.bind(this));
        var showResultsButton = document.querySelector('#showResultsButton');
        showResultsButton.addEventListener('click', this.showResultsPage.bind(this));
        var backToOverviewButton = document.querySelector('#backToOverview');
        backToOverviewButton.addEventListener('click', this.showOverviewPage.bind(this));
        var editLinkDialog = document.querySelector('#editLinkDialog');
        editLinkDialog.addEventListener('click', this.handleDialogClick.bind(this));
        var deleteLinkDialog = document.querySelector('#deleteLinkDialog');
        deleteLinkDialog.addEventListener('click', this.handleDialogClick.bind(this));
        var paginationElement = document.querySelector('#pagination');
        paginationElement.addEventListener('click', function (e) {
            var target = e.target;
            if (target.classList.contains('page-button')) {
                var page = target.textContent === '<' ? _this.currentPage - 1 :
                    target.textContent === '>' ? _this.currentPage + 1 :
                        parseInt(target.textContent || '1', 10);
                var totalPages = Math.ceil(_this.links.length / _this.LINKS_PER_PAGE);
                _this.goToPage(page, totalPages);
            }
        });
    };
    // Handle clicking dialog backdrops to close
    LinksManager.prototype.handleDialogClick = function (e) {
        var target = e.target;
        if (target.tagName === 'DIALOG') {
            target.close();
        }
    };
    // Render the links to the DOM
    LinksManager.prototype.renderLinks = function () {
        var linksList = document.querySelector('#linksList');
        linksList.innerHTML = '';
        var startIndex = (this.currentPage - 1) * this.LINKS_PER_PAGE;
        var endIndex = startIndex + this.LINKS_PER_PAGE;
        var linksToShow = this.links.slice(startIndex, endIndex);
        linksToShow.forEach(function (link) {
            var li = document.createElement('li');
            li.setAttribute('role', 'listitem');
            li.innerHTML = "\n        <div class=\"link-item\">\n          <a role=\"link\" href=\"".concat(link.url, "\" target=\"_blank\">").concat(link.url, "</a>\n          <div class=\"buttons-wrapper\">\n            <button role=\"Edit link\" class=\"edit\" data-id=\"").concat(link.id, "\">Edit</button>\n            <button role=\"Delete link\" class=\"delete\" data-id=\"").concat(link.id, "\">Delete</button>\n          </div>\n        </div>\n      ");
            linksList.appendChild(li);
        });
        this.renderPagination();
    };
    LinksManager.prototype.renderPagination = function () {
        var _this = this;
        var paginationElement = document.querySelector('#pagination');
        paginationElement.innerHTML = '';
        var totalPages = Math.ceil(this.links.length / this.LINKS_PER_PAGE);
        if (totalPages <= 1)
            return;
        var createPageButton = function (page, text) {
            if (text === void 0) { text = page.toString(); }
            var button = document.createElement('button');
            button.textContent = text;
            button.classList.add('page-button');
            if (page === _this.currentPage)
                button.classList.add('active');
            console.log('page: ' + page);
            console.log('current: ' + _this.currentPage);
            button.addEventListener('click', function () { return _this.goToPage(page, totalPages); });
            return button;
        };
        // TODO: Fix this
        // Previous button
        paginationElement.appendChild(createPageButton((this.currentPage - 1) <= 0 ? 1 : this.currentPage - 1, '<'));
        // Page numbers
        for (var i = 1; i <= totalPages; i++) {
            if (i === 1 ||
                i === totalPages ||
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationElement.appendChild(createPageButton(i));
            }
            else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationElement.appendChild(document.createTextNode('...'));
            }
        }
        // TODO: Fix this
        // Next button
        paginationElement.appendChild(createPageButton((this.currentPage + 1) >= totalPages ? totalPages : this.currentPage + 1, '>'));
    };
    LinksManager.prototype.goToPage = function (page, totalPages) {
        this.currentPage = page;
        this.renderLinks();
    };
    // Format a URL
    LinksManager.prototype.formatUrl = function (url) {
        // Remove trailing slash if it exists
        var trimmedUrl = url.replace(/\/$/, '');
        // Add trailing slash
        return "".concat(trimmedUrl, "/");
    };
    // Add a new link to the list
    LinksManager.prototype.addLink = function (url) {
        var formattedUrl = this.formatUrl(url);
        var newLink = {
            id: Date.now(),
            url: formattedUrl,
        };
        this.links.push(newLink);
        this.saveLinks();
        this.renderLinks();
    };
    // Save the links to local storage
    LinksManager.prototype.saveLinks = function () {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.links));
    };
    // Edit a link in the list
    LinksManager.prototype.editLink = function (id, newUrl) {
        var linkIndex = -1;
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].id === id) {
                linkIndex = i;
                break;
            }
        }
        // If found, update the link
        if (linkIndex !== -1) {
            this.links[linkIndex].url = newUrl;
            this.saveLinks();
            this.renderLinks();
        }
    };
    // Delete a link from the list
    LinksManager.prototype.deleteLink = function (id) {
        this.links = this.links.filter(function (link) { return link.id !== id; });
        this.saveLinks();
        this.renderLinks();
    };
    // Handle submit event for adding a new link
    LinksManager.prototype.handleAddLinkSubmit = function (e) {
        var _this = this;
        e.preventDefault();
        var urlInput = document.querySelector('#url');
        if (this.isValidUrl(urlInput.value)) {
            this.showMessage('Trying to fetch if url exists...', 'message', false);
            this.checkIsExists(urlInput.value, function (exists) {
                if (exists) {
                    _this.addLink(urlInput.value);
                    urlInput.value = '';
                    _this.showMessage('Successfully added link!', 'message', false);
                }
                else {
                    _this.showMessage('The URL does not exist or is not accessible', 'message', true);
                }
            });
        }
        else {
            this.showMessage('Please enter a valid URL', 'message', true);
        }
    };
    // Handle edit and delete actions on links
    LinksManager.prototype.handleLinkActions = function (e) {
        var target = e.target;
        if (target.classList.contains('edit')) {
            var id = Number(target.getAttribute('data-id'));
            this.openEditDialog(id);
        }
        else if (target.classList.contains('delete')) {
            var id = Number(target.getAttribute('data-id'));
            this.openDeleteDialog(id);
        }
    };
    // Open the edit dialog for a link
    LinksManager.prototype.openEditDialog = function (id) {
        this.editingLinkId = id;
        var link;
        // Find the link to edit
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].id === id) {
                link = this.links[i];
                break;
            }
        }
        var editLinkUrl = document.querySelector('#editLinkUrl');
        editLinkUrl.value = link ? link.url : '';
        var editLinkDialog = document.querySelector('#editLinkDialog');
        editLinkDialog.showModal();
        this.showMessage('', 'editMessage', false); // Clear any existing error message
    };
    // Close the edit dialog for a link
    LinksManager.prototype.closeEditDialog = function () {
        var editLinkDialog = document.querySelector('#editLinkDialog');
        editLinkDialog.close();
    };
    // Handle submit event for editing a link
    LinksManager.prototype.handleEditLinkSubmit = function (e) {
        var _this = this;
        e.preventDefault();
        var editLinkUrl = document.querySelector('#editLinkUrl');
        var formattedUrl = this.formatUrl(editLinkUrl.value);
        if (this.editingLinkId && this.isValidUrl(formattedUrl)) {
            this.showMessage('Trying to fetch if url exists...', 'editMessage', false);
            this.checkIsExists(formattedUrl, function (exists) {
                if (exists) {
                    _this.editLink(_this.editingLinkId, formattedUrl);
                    _this.showMessage('Successfully edited link!', 'editMessage', false);
                    _this.closeEditDialog();
                }
                else {
                    _this.showMessage('The URL does not exist or is not accessible', 'editMessage', true);
                }
            });
        }
        else {
            this.showMessage('Please enter a valid URL', 'editMessage', true);
        }
    };
    // Open the delete dialog for a link
    LinksManager.prototype.openDeleteDialog = function (id) {
        this.editingLinkId = id;
        var deleteLinkDialog = document.querySelector('#deleteLinkDialog');
        deleteLinkDialog.showModal();
    };
    // Close the delete dialog for a link
    LinksManager.prototype.closeDeleteDialog = function () {
        var deleteLinkDialog = document.querySelector('#deleteLinkDialog');
        deleteLinkDialog.close();
    };
    // Handle submit event for deleting a link
    LinksManager.prototype.handleDeleteConfirm = function () {
        if (this.editingLinkId) {
            this.deleteLink(this.editingLinkId);
            this.closeDeleteDialog();
        }
    };
    // TODO: Implement this via CORS middleware
    // Check if a URL exists
    LinksManager.prototype.checkIsExists = function (url, callback) {
        return callback(true);
        console.log('Trying to fetch url: ' + url);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            console.log(xhr);
            if (xhr.readyState === 4) { // Request is done
                if (xhr.status >= 200 && xhr.status < 308) {
                    callback(true); // URL exists
                }
                else {
                    callback(false); // URL doesn't exist or there was an error
                }
            }
        };
        xhr.onerror = function () {
            callback(false); // Network error occurred
        };
        xhr.open('HEAD', url, true);
        xhr.send();
    };
    // Validate a URL
    LinksManager.prototype.isValidUrl = function (url) {
        try {
            var formattedUrl = this.formatUrl(url);
            new URL(formattedUrl);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    // Show an error message
    LinksManager.prototype.showMessage = function (messageText, elementId, isError) {
        if (elementId === void 0) { elementId = 'message'; }
        if (isError === void 0) { isError = true; }
        var messageElement = document.querySelector("#".concat(elementId));
        if (messageElement) {
            messageElement.textContent = messageText;
            if (isError) {
                messageElement.classList.add('error');
            }
            else {
                messageElement.classList.remove('error');
            }
        }
    };
    // Show the results page
    LinksManager.prototype.showResultsPage = function () {
        var formPage = document.querySelector('#form-page');
        var resultsPage = document.querySelector('#results-page');
        var submittedUrlLinksList = document.querySelector('#submittedUrlLinksList');
        // Hide the overview page and show the results page
        formPage.classList.add('hidden');
        resultsPage.classList.remove('hidden');
        // Populate the results page with the list of links
        submittedUrlLinksList.innerHTML = '';
        this.links.forEach(function (link) {
            var li = document.createElement('li');
            li.setAttribute('role', 'listitem');
            li.innerHTML = "\n        <a role=\"link\" href=\"".concat(link.url, "\" target=\"_blank\">").concat(link.url, "</a>\n      ");
            submittedUrlLinksList.appendChild(li);
        });
    };
    // Show the overview page
    LinksManager.prototype.showOverviewPage = function () {
        var formPage = document.querySelector('#form-page');
        var resultsPage = document.querySelector('#results-page');
        // Hide the results page and show the overview page
        resultsPage.classList.add('hidden');
        formPage.classList.remove('hidden');
    };
    return LinksManager;
}());
// Initialize the LinksManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new LinksManager();
});
