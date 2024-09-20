// Interface for a link
interface Link {
  url: string;
  id: number;
}

// LinksManager class to manage the links
class LinksManager {
  private links: Link[] = [];
  private readonly STORAGE_KEY = 'links-manager';
  private editingLinkId: number | null = null;
  private currentPage: number = 1;
  private readonly LINKS_PER_PAGE: number = 20;

  // Constructor to initialize the LinksManager
  constructor() {
    this.loadLinks();
    this.setupEventListeners();
    this.renderLinks();
  }

  // Load the links from local storage
  private loadLinks(): void {
    const storedLinks = localStorage.getItem(this.STORAGE_KEY);
    if (storedLinks) {
      this.links = JSON.parse(storedLinks);
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    const form = document.querySelector('#urlLinksForm') as HTMLFormElement;
    form.addEventListener('submit', this.handleAddLinkSubmit.bind(this));

    const linksList = document.querySelector('#linksList') as HTMLUListElement;
    linksList.addEventListener('click', this.handleLinkActions.bind(this));

    const editLinkForm = document.querySelector('#editLinkForm') as HTMLFormElement;
    editLinkForm.addEventListener('submit', this.handleEditLinkSubmit.bind(this));

    const cancelEditLink = document.querySelector('#cancelEditLink') as HTMLButtonElement;
    cancelEditLink.addEventListener('click', this.closeEditDialog.bind(this));

    const confirmDeleteLink = document.querySelector('#confirmDeleteLink') as HTMLButtonElement;
    confirmDeleteLink.addEventListener('click', this.handleDeleteConfirm.bind(this));

    const cancelDeleteLink = document.querySelector('#cancelDeleteLink') as HTMLButtonElement;
    cancelDeleteLink.addEventListener('click', this.closeDeleteDialog.bind(this));

    const showResultsButton = document.querySelector('#showResultsButton') as HTMLButtonElement;
    showResultsButton.addEventListener('click', this.showResultsPage.bind(this));

    const backToOverviewButton = document.querySelector('#backToOverview') as HTMLButtonElement;
    backToOverviewButton.addEventListener('click', this.showOverviewPage.bind(this));

    const editLinkDialog = document.querySelector('#editLinkDialog') as HTMLDialogElement;
    editLinkDialog.addEventListener('click', this.handleDialogClick.bind(this));

    const deleteLinkDialog = document.querySelector('#deleteLinkDialog') as HTMLDialogElement;
    deleteLinkDialog.addEventListener('click', this.handleDialogClick.bind(this));

    const paginationElement = document.querySelector('#pagination') as HTMLDivElement;
    paginationElement.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('page-button')) {
        const page = target.textContent === '<' ? this.currentPage - 1 :
                     target.textContent === '>' ? this.currentPage + 1 :
                     parseInt(target.textContent || '1', 10);
        const totalPages = Math.ceil(this.links.length / this.LINKS_PER_PAGE);
        this.goToPage(page, totalPages);
      }
    });
  }

  // Handle clicking dialog backdrops to close
  private handleDialogClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'DIALOG') {
      (target as HTMLDialogElement).close();
    }
  }

  // Render the links to the DOM
  private renderLinks(): void {
    const linksList = document.querySelector('#linksList') as HTMLOListElement;
    linksList.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.LINKS_PER_PAGE;
    const endIndex = startIndex + this.LINKS_PER_PAGE;
    const linksToShow = this.links.slice(startIndex, endIndex);

    linksToShow.forEach(link => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.innerHTML = `
        <div class="link-item">
          <a role="link" href="${link.url}" target="_blank">${link.url}</a>
          <div class="buttons-wrapper">
            <button role="Edit link" class="edit" data-id="${link.id}">Edit</button>
            <button role="Delete link" class="delete" data-id="${link.id}">Delete</button>
          </div>
        </div>
      `;
      linksList.appendChild(li);
    });

    this.renderPagination();
  }

  private renderPagination(): void {
    const paginationElement = document.querySelector('#pagination') as HTMLDivElement;
    paginationElement.innerHTML = '';

    const totalPages = Math.ceil(this.links.length / this.LINKS_PER_PAGE);

    if (totalPages <= 1) return;

    const createPageButton = (page: number, text: string = page.toString()) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.classList.add('page-button');
      if (page === this.currentPage) button.classList.add('active');
      console.log('page: ' + page);
      console.log('current: '+ this.currentPage);
      button.addEventListener('click', () => this.goToPage(page, totalPages));
      return button;
    };

    // Previous button
    paginationElement.appendChild(createPageButton( (this.currentPage - 1) <= 0 ? 1 : this.currentPage - 1, '<'));

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        paginationElement.appendChild(createPageButton(i));
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        paginationElement.appendChild(document.createTextNode('...'));
      }
    }

    // Next button
    paginationElement.appendChild(createPageButton( (this.currentPage + 1) >= totalPages ? totalPages : this.currentPage + 1, '>'));
  }

  private goToPage(page: number, totalPages: number): void {
    this.currentPage = page;
    this.renderLinks();
  }

  // Format a URL
  private formatUrl(url: string): string {
    // Remove trailing slash if it exists
    const trimmedUrl = url.replace(/\/$/, '');
    // Add trailing slash
    return `${trimmedUrl}/`;
  }

  // Add a new link to the list
  private addLink(url: string): void {
    const formattedUrl = this.formatUrl(url);
    const newLink: Link = {
      id: Date.now(),
      url: formattedUrl,
    };
    this.links.push(newLink);
    this.saveLinks();
    this.renderLinks();
  }
  
  // Save the links to local storage
  private saveLinks(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.links));
  }

  // Edit a link in the list
  private editLink(id: number, newUrl: string): void {
    let linkIndex = -1;
    for (let i = 0; i < this.links.length; i++) {
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
  }

  // Delete a link from the list
  private deleteLink(id: number): void {
    this.links = this.links.filter(link => link.id !== id);
    this.saveLinks();
    this.renderLinks();
  }

  // Handle submit event for adding a new link
  private handleAddLinkSubmit(e: Event): void {
    e.preventDefault();
    const urlInput = document.querySelector('#url') as HTMLInputElement;

    if (this.isValidUrl(urlInput.value)) {
      this.showMessage('Trying to fetch if url exists...', 'message', false);
      this.checkIsExists(urlInput.value, (exists) => {
        if (exists) {
          this.addLink(urlInput.value);
          urlInput.value = '';
          this.showMessage('Successfully added link!', 'message', false);
        } else {
          this.showMessage('The URL does not exist or is not accessible', 'message', true);
        }
      });
    } else {
      this.showMessage('Please enter a valid URL', 'message', true);
    }
  }

  // Handle edit and delete actions on links
  private handleLinkActions(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('edit')) {
      const id = Number(target.getAttribute('data-id'));
      this.openEditDialog(id);
    } else if (target.classList.contains('delete')) {
      const id = Number(target.getAttribute('data-id'));
      this.openDeleteDialog(id);
    }
  }

  // Open the edit dialog for a link
  private openEditDialog(id: number): void {
    this.editingLinkId = id;
    let link: Link | undefined;

    // Find the link to edit
    for (let i = 0; i < this.links.length; i++) {
      if (this.links[i].id === id) {
        link = this.links[i];
        break;
      }
    }

    const editLinkUrl = document.querySelector('#editLinkUrl') as HTMLInputElement;
    editLinkUrl.value = link ? link.url : '';
    const editLinkDialog = document.querySelector('#editLinkDialog') as HTMLDialogElement;
    editLinkDialog.showModal();
    this.showMessage('', 'editMessage', false); // Clear any existing error message
  }

  // Close the edit dialog for a link
  private closeEditDialog(): void {
    const editLinkDialog = document.querySelector('#editLinkDialog') as HTMLDialogElement;
    editLinkDialog.close();
  }

  // Handle submit event for editing a link
  private handleEditLinkSubmit(e: Event): void {
    e.preventDefault();
    const editLinkUrl = document.querySelector('#editLinkUrl') as HTMLInputElement;
    const formattedUrl = this.formatUrl(editLinkUrl.value);
    if (this.editingLinkId && this.isValidUrl(formattedUrl)) {
      this.showMessage('Trying to fetch if url exists...', 'editMessage', false);
      this.checkIsExists(formattedUrl, (exists) => {
        if (exists) {
          this.editLink(this.editingLinkId!, formattedUrl);
          this.showMessage('Successfully edited link!', 'editMessage', false);
          this.closeEditDialog();
        } else {
          this.showMessage('The URL does not exist or is not accessible', 'editMessage', true);
        }
      });
    } else {
      this.showMessage('Please enter a valid URL', 'editMessage', true);
    }
  }

  // Open the delete dialog for a link
  private openDeleteDialog(id: number): void {
    this.editingLinkId = id;
    const deleteLinkDialog = document.querySelector('#deleteLinkDialog') as HTMLDialogElement;
    deleteLinkDialog.showModal();
  }

  // Close the delete dialog for a link
  private closeDeleteDialog(): void {
    const deleteLinkDialog = document.querySelector('#deleteLinkDialog') as HTMLDialogElement;
    deleteLinkDialog.close();
  }

  // Handle submit event for deleting a link
  private handleDeleteConfirm(): void {
    if (this.editingLinkId) {
      this.deleteLink(this.editingLinkId);
      this.closeDeleteDialog();
    }
  }

  // Check if a URL exists
  private checkIsExists(url: string, callback: (exists: boolean) => void): void {
    console.log('Trying to fetch url: ' + url);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      console.log(xhr);
      if (xhr.readyState === 4) { // Request is done
        if (xhr.status >= 200 && xhr.status < 308) {
          callback(true); // URL exists
        } else {
          callback(false); // URL doesn't exist or there was an error
        }
      }
    };
    xhr.onerror = function() {
      callback(false); // Network error occurred
    };
    xhr.open('HEAD', url, true);
    xhr.send();
  }

  // Validate a URL
  private isValidUrl(url: string) {
    try {
      const formattedUrl = this.formatUrl(url);
      new URL(formattedUrl);
      return true;
    } catch {
      return false;
    }
  }

  // Show an error message
  private showMessage(messageText: string, elementId: string = 'message', isError: boolean = true): void {
    const messageElement = document.querySelector(`#${elementId}`) as HTMLDivElement;
    if (messageElement) {
      messageElement.textContent = messageText;
      if (isError) {
        messageElement.classList.add('error');
      }
      else {
        messageElement.classList.remove('error');
      }
    }
  }

  // Show the results page
  private showResultsPage(): void {
    const formPage = document.querySelector('#form-page') as HTMLElement;
    const resultsPage = document.querySelector('#results-page') as HTMLElement;
    const submittedUrlLinksList = document.querySelector('#submittedUrlLinksList') as HTMLElement;

    // Hide the overview page and show the results page
    formPage.classList.add('hidden');
    resultsPage.classList.remove('hidden');

    // Populate the results page with the list of links
    submittedUrlLinksList.innerHTML = '';
    this.links.forEach(link => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.innerHTML = `
        <a role="link" href="${link.url}" target="_blank">${link.url}</a>
      `;
      submittedUrlLinksList.appendChild(li);
    });
  }

  // Show the overview page
  private showOverviewPage(): void {
    const formPage = document.querySelector('#form-page') as HTMLElement;
    const resultsPage = document.querySelector('#results-page') as HTMLElement;

    // Hide the results page and show the overview page
    resultsPage.classList.add('hidden');
    formPage.classList.remove('hidden');
  }
}

// Initialize the LinksManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LinksManager();
});