function createElemWithText(elementName = 'p', textContent = '', className) {
    const element = document.createElement(elementName);
    element.textContent = textContent;

    if (className) {
        element.className = className;
    }

    return element;
}

function createSelectOptions(usersData) {
    if (!usersData) {
      return undefined;
    }

    const options = [];

    usersData.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      options.push(option);
    });

    return options;
}

function toggleCommentSection(postId) {
    if (!postId) {
      return undefined;
    }

    const section = document.querySelector(`section[data-post-id="${postId}"]`);

    if (section) {
      section.classList.toggle('hide');
    }

    return section;
}

function toggleCommentButton(postId) {
    if (!postId) {
      return undefined;
    }

    const button = document.querySelector(`button[data-post-id="${postId}"]`);

    if (button === null) {
      return null;
    }

    if (!button) {
      const newButton = document.createElement('button');
      newButton.setAttribute('data-post-id', postId);
      newButton.textContent = 'Show Comments';
      document.body.appendChild(newButton);
      return newButton;
    }

    button.textContent = button.textContent === 'Show Comments' ? 'Hide Comments' : 'Show Comments';
    return button;
}

function deleteChildElements(parentElement) {
    if (!parentElement || !(parentElement instanceof Element)) {
      return undefined;
    }

    let child = parentElement.lastElementChild;

    while (child) {
      parentElement.removeChild(child);
      child = parentElement.lastElementChild;
    }

    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');

    if (buttons.length > 0) {
      buttons.forEach(button => {
        const postId = button.dataset.postId;
        if (postId) {
          button.addEventListener('click', function(event) {
            toggleComments(event, postId);
          });
        }
      });
    }

    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');

    if (buttons.length > 0) {
        const buttonElements = [];

        buttons.forEach(button => {
            const postId = button.dataset.postId;

            if (postId) {
                const clickListener = event => {
                    toggleComments(event, postId);
                };

                button.removeEventListener('click', clickListener);

                buttonElements.push(button);
            }
        });

        return buttonElements;
    }

    return [];
}

function createComments(commentsData) {
    if (!commentsData) {
        return undefined;
    }

    const fragment = document.createDocumentFragment();

    commentsData.forEach(comment => {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const bodyParagraph = createElemWithText('p', comment.body);
        const emailParagraph = createElemWithText('p', `From: ${comment.email}`);

        article.appendChild(h3);
        article.appendChild(bodyParagraph);
        article.appendChild(emailParagraph);

        fragment.appendChild(article);
    });

    return fragment;
}

function populateSelectMenu(userData) {
    if (!userData || !Array.isArray(userData)) {
      return undefined;
    }

    const selectMenu = document.getElementById('selectMenu');

    const options = createSelectOptions(userData);

    if (!options || !Array.isArray(options)) {
      return undefined;
    }

    options.forEach(option => {
      selectMenu.appendChild(option);
    });

    return selectMenu;
}

async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching users data:', error);
        throw new Error('Failed to fetch users data');
    }
}

async function getUserPosts(userId) {
    if (userId === undefined) {
      console.error('No user ID provided');
      return undefined;
    }

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }
      const postData = await response.json();
      return postData;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return null;
    }
}

async function getUser(userId) {
    if (!userId) {
        return undefined;
    }

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error(`Error fetching user ${userId} data:`, error);
        throw new Error(`Failed to fetch user ${userId} data`);
    }
}

async function getPostComments(postId) {
    if (postId === undefined) {
        return undefined;
    }

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        const commentsData = await response.json();
        return commentsData;
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        throw new Error(`Failed to fetch comments for post ${postId}`);
    }
}

async function displayComments(postId) {
    if (postId === undefined) {
        return undefined;
    }

    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');

    try {
        const comments = await getPostComments(postId);
        const fragment = createComments(comments);

        section.appendChild(fragment);
        return section;
    } catch (error) {
        console.error(`Error displaying comments for post ${postId}:`, error);
        throw new Error(`Failed to display comments for post ${postId}`);
    }
}

async function createPosts(postsData) {
    if (postsData === undefined) {
        return undefined;
    }

    const fragment = document.createDocumentFragment();

    for (const post of postsData) {
        const article = document.createElement('article');

        const h2 = createElemWithText('h2', post.title);
        const bodyParagraph = createElemWithText('p', post.body);
        const postIdParagraph = createElemWithText('p', `Post ID: ${post.id}`);

        const author = await getUser(post.userId);
        const authorInfoParagraph = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const catchPhraseParagraph = createElemWithText('p', author.company.catchPhrase);

        const button = document.createElement('button');
        button.textContent = 'Show Comments';
        button.dataset.postId = post.id;

        article.appendChild(h2);
        article.appendChild(bodyParagraph);
        article.appendChild(postIdParagraph);
        article.appendChild(authorInfoParagraph);
        article.appendChild(catchPhraseParagraph);
        article.appendChild(button);

        const section = await displayComments(post.id);
        article.appendChild(section);

        fragment.appendChild(article);
    }

    return fragment;
}

async function displayPosts(postsData) {
    const mainElement = document.querySelector('main');
    let element;

    if (postsData) {
        element = await createPosts(postsData);
    } else {
        const defaultParagraphText = 'Select an Employee to display their posts.';
        const paragraphElement = createElemWithText('p', defaultParagraphText, 'default-text');
        element = paragraphElement;
    }

    mainElement.appendChild(element);
    return element;
}

function toggleComments(event, postId) {
    if (!event || !postId) {
        return undefined;
    }

    event.target.listener = true;

    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);

    return [section, button];
}

async function refreshPosts(postsData) {
    if (!postsData) {
        return undefined;
    }

    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(postsData);
    const addButtons = addButtonListeners();

    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    const selectMenu = (event && event.target) ? event.target : null;
    const userId = (selectMenu && selectMenu.value) ? selectMenu.value : 1;

    if (!event || !selectMenu) {
        return undefined;
    }

    selectMenu.disabled = true;

    try {
        const posts = await getUserPosts(userId);
        const refreshPostsArray = await refreshPosts(posts);

        selectMenu.disabled = false;

        return [userId, posts, refreshPostsArray];
    } catch (error) {
        console.error('Error in selectMenuChangeEventHandler:', error);
        selectMenu.disabled = false;
        throw new Error('Failed to handle select menu change event');
    }
}

async function initPage() {
    try {
        const users = await getUsers();
        const select = populateSelectMenu(users);

        if (!users || !select) {
            return [null, null];
        }

        return [users, select];
    } catch (error) {
        console.error('Error in initPage:', error);
        throw new Error('Failed to initialize the page');
    }
}

function initApp() {
    const [users, select] = initPage();

    const selectMenu = document.getElementById('selectMenu');
    selectMenu.addEventListener('change', async function(event) {
        await selectMenuChangeEventHandler(event);
    });
}
