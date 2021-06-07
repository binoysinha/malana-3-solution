/**
 * @author Binoy Sinha <binoy.sinha@hotmail.com>
 */


const BASE_URL = 'https://salesforce-blogs.herokuapp.com/blogs/api/';

const postsContainer = document.getElementById('posts-container');
const postLists = document.getElementById('posts-list');
const form = document.getElementById('form');
const postTitle = document.getElementById('post-title');
const postText = document.getElementById('post-text');
const createPost = document.getElementById('create-post');
const modeType = document.getElementById('mode-type');
const resetForm = document.getElementById('reset-form');
const appName = document.getElementById('app-name');
const deleteAllBtn = document.getElementById('delete-all-post');
const mainContainer = document.querySelector('.main-container');
const createBlog = document.querySelector('.create-blog');
const loading = document.querySelector('.loader');

let DATA_STORE = [];
let mode = '';
let selectedPostId = '';

/**
 * @param postId
 * This functions is invoked on specific post click and detects loaction hash to load specific post
 */
function loadSpecificPost(postId) {
    if (location.hash !== '') {
        let postId = Number(location.hash.substring(2));
        const post = DATA_STORE.filter(post => post.id === postId);
        postsContainer.innerHTML = '';
        postsContainer.classList.add('no-truncate');
        showPostDetails(post);
    } else {
        postsContainer.classList.remove('no-truncate');
        showPostDetails(DATA_STORE);
    }
}

// Fetch all posts
async function getPosts() {
    try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        DATA_STORE = data;
        return data;
    } catch (e) {
        console.error('Failed to fetch posts');
    } finally {
        loading.classList.add('hide');
        mainContainer.classList.toggle('hide');
    }
}

async function deleteAllPosts() {
    try {
        const res = await fetch(BASE_URL, {
            method: 'DELETE'
        });
        location.reload();
    } catch (e) {
        console.error('Failed to delete');
    }
};

async function getSpecificPost(postId) {
    try {
        const res = await fetch(`${BASE_URL}${postId}`);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error('Failed to fetch posts');
    }
}

async function deletePost(postId) {
    try {
        const res = await fetch(`${BASE_URL}${postId}`, {
            method: 'DELETE'
        });
        location.reload();
    } catch (e) {
        console.error('Failed to delete');
    }

}

function toggleClass() {
    if (mainContainer.classList.contains('hide')) {
        mainContainer.classList.remove('hide');
        form.classList.add('hide');
    } else if (form.classList.contains('hide')) {
        mainContainer.classList.add('hide');
        form.classList.remove('hide');
    }

}

async function editPost(postId) {
    toggleClass();
    mode = 'edit';
    selectedPostId = postId;
    modeType.innerText = 'Edit blog post'
    try {
        const postObj = await getSpecificPost(postId);
        postTitle.value = postObj.title;
        postText.value = postObj.text;
    } catch (e) {
        console.error('Failed to fetch post');
    }
}

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: postTitle.value,
            text: postText.value
        })
    };
    const URL = mode === 'edit' ? `${BASE_URL}${selectedPostId}` : BASE_URL;

    fetch(URL, requestOptions)
        .then(response => response.json())
        .then(data => location.reload())
        .catch(e => console.error('Failed to create/update blog'))
        .finally(() => {
            toggleClass();
        })
});

function formatTimeStamp(ts) {
    const date = new Date(ts);
    return date.toLocaleDateString();
}

// show posts in DOM
function showPostDetails(posts) {
    const results = [];

    if (!posts.length) {
        postsContainer.innerHTML = 'No posts available. Create a new one.';
    } else {
        posts.forEach(post => {
            const postEl = document.createElement('article');
            postEl.classList.add(`post-${post.id}`);
            postEl.classList.add('post');
            postEl.innerHTML = `
          <div class="post-meta-info">
             <a href="#/${post.id}">Post ${post.id}</a>
             <time>${formatTimeStamp(post.timestamp)}</time>
          </div>
          <div class="post-info">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-body">${post.text}</p>
          </div>
          <div class="btn-group">
            <button class="primary-btn" onclick="editPost(${
                post.id
            })">Edit</button>
            <button onclick="deletePost(${
                post.id
            })">Delete</button>
          </div>
        `;
            results.push(postEl);
        });
        postsContainer.append(...results);
    }

}

// Generate view for left side
function showPostIndexes(posts) {
    const results = [];
    posts.forEach(post => {
        const postEl = document.createElement('li');
        postEl.classList.add(`post-${post.id}`);
        postEl.innerHTML = `
          <div class="post-meta-info">
             <a href="#/${post.id}">Post ${post.id}</a>
             <time>${formatTimeStamp(post.timestamp)}</time>
          </div>
        `;
        results.push(postEl);
    });
    postLists.append(...results);
}

async function generatePosts() {
    try {
        const posts = await getPosts();
        if (location.hash !== '') {
            loadSpecificPost();
        } else {
            showPostDetails(posts);
        }
        showPostIndexes(posts);
    } catch (e) {
        console.error('Failed to fetch posts...')
    }

}

createPost.addEventListener('pointerdown', () => {
    if (!mainContainer.classList.contains('hide')) {
        toggleClass();
    }
    form.reset();
    mode = 'create';
    selectedPostId = '';
    modeType.innerText = 'Create a new blog post'
});

resetForm.addEventListener('pointerdown', () => {
    form.reset();
    toggleClass();
});

appName.addEventListener('pointerdown', () => {
    if (DATA_STORE.length) {
        location.hash = '';
    }
});

deleteAllBtn.addEventListener('pointerdown', deleteAllPosts);

window.addEventListener('hashchange', loadSpecificPost);

generatePosts();