
// 论坛页面功能实现（优化版）
// 1. 封装为Forum对象，2. 统一异步风格，3. 优化事件绑定，4. 统一错误处理，5. 优化DOM操作，6. 权限校验，7. API路径统一管理，8. 增加注释和判空

const API = {
  user: '/api/user',
  posts: '/api/posts',
  postLike: id => `/api/posts/${id}/like`,
  postComments: id => `/api/posts/${id}/comments`,
  users: '/api/users',
  categories: '/api/categories',
  tags: '/api/tags'
};

const Forum = {
  posts: [],
  currentUser: {id: 1, name: "Guest"},
  commentsCache: {},

  async init() {
    await this.fetchUser();
    await this.fetchPosts();
    this.setupEventListeners();
  },

  async fetchUser() {
    try {
      const res = await fetch(API.user);
      if (!res.ok) throw new Error('获取用户信息失败');
      this.currentUser = await res.json();
    } catch (err) {
      this.handleError(err, '无法获取用户信息');
    }
  },

  async fetchPosts(params = {}) {
    try {
      const urlParams = new URLSearchParams(params);
      const res = await fetch(`${API.posts}?${urlParams}`);
      if (!res.ok) throw new Error('获取帖子列表失败');
      const data = await res.json();
      this.posts = [...data.posts];
      this.renderPosts();
      this.renderPagination(data.currentPage || 1, data.totalPages || 1);
    } catch (err) {
      this.handleError(err, '无法获取帖子列表');
    }
  },

  renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    postsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    this.posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post';
      postElement.id = `post-${post.id}`;

      const title = document.createElement('h3');
      title.textContent = post.title;
      postElement.appendChild(title);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
  // 防止XSS攻击，对帖子内容进行escape
  contentDiv.textContent = this.escapeHtml(post.content);
      postElement.appendChild(contentDiv);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `作者: ${post.author}`;
      postElement.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const likeBtn = document.createElement('button');
      likeBtn.textContent = `点赞 (${post.likes})`;
      likeBtn.onclick = () => this.likePost(post.id);
      actions.appendChild(likeBtn);

      const commentBtn = document.createElement('button');
      commentBtn.textContent = `评论 (${post.comments_count})`;
      commentBtn.onclick = () => this.showComments(post.id);
      actions.appendChild(commentBtn);

      postElement.appendChild(actions);

      const commentsDiv = document.createElement('div');
      commentsDiv.className = 'comments';
      commentsDiv.id = `comments-${post.id}`;
      commentsDiv.style.display = 'none';
      postElement.appendChild(commentsDiv);

      const commentInput = document.createElement('input');
      commentInput.type = 'text';
      commentInput.id = `comment-input-${post.id}`;
      commentInput.placeholder = '添加评论...';
      postElement.appendChild(commentInput);

      const submitBtn = document.createElement('button');
      submitBtn.textContent = '提交评论';
      submitBtn.onclick = () => this.addComment(post.id);
      postElement.appendChild(submitBtn);

      fragment.appendChild(postElement);
    });
    postsContainer.appendChild(fragment);
  },

  renderPagination(page, totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (page > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '上一页';
      prevBtn.onclick = () => this.fetchPosts({page: page - 1});
      pagination.appendChild(prevBtn);
    }
    if (page < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '下一页';
      nextBtn.onclick = () => this.fetchPosts({page: page + 1});
      pagination.appendChild(nextBtn);
    }
  },

  async likePost(postId) {
    if (!this.currentUser || !this.currentUser.id) {
      alert('请先登录');
      return;
    }
    try {
      const res = await fetch(API.postLike(postId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCsrfToken()
        },
        body: JSON.stringify({user_id: this.currentUser.id})
      });
      if (!res.ok) throw new Error('点赞失败');
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.likes++;
        const likeBtn = document.querySelector(`#post-${postId} .actions button:first-child`);
        if (likeBtn) likeBtn.textContent = `点赞 (${post.likes})`;
      }
    } catch (err) {
      this.handleError(err, '点赞失败');
    }
  },

  async showComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (!commentsContainer) return;
    // 简单缓存，减少重复请求
    if (this.commentsCache[postId]) {
      this.renderComments(commentsContainer, this.commentsCache[postId]);
      commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
      return;
    }
    try {
      const res = await fetch(API.postComments(postId));
      if (!res.ok) throw new Error('获取评论失败');
      const data = await res.json();
      this.commentsCache[postId] = data.comments;
      this.renderComments(commentsContainer, data.comments);
      commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
    } catch (err) {
      this.handleError(err, '获取评论失败');
    }
  },

  renderComments(container, comments) {
    container.innerHTML = '';
    comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment';
      const author = document.createElement('strong');
      author.textContent = this.escapeHtml(comment.author);
      commentDiv.appendChild(author);
      commentDiv.appendChild(document.createTextNode(': ' + this.escapeHtml(comment.content)));
      container.appendChild(commentDiv);
    });
  },

  async addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    const content = input.value;
    if (content.trim().length < 3) {
      alert('评论内容不能少于3个字符');
      return;
    }
    if (!this.currentUser.id) {
      alert('请先登录');
      return;
    }
    try {
      const res = await fetch(API.postComments(postId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCsrfToken()
        },
        body: JSON.stringify({
          user_id: this.currentUser.id,
          content: content
        })
      });
      if (!res.ok) throw new Error('评论提交失败');
      input.value = '';
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.comments_count++;
        // 修正评论按钮选择器，选择actions下的评论按钮
        const commentBtn = document.querySelector(`#post-${postId} .actions button:nth-child(2)`);
        if (commentBtn) commentBtn.textContent = `评论 (${post.comments_count})`;
      }
      // 刷新评论
      await this.showComments(postId);
    } catch (err) {
      this.handleError(err, '评论提交失败');
    }
  },

  setupEventListeners() {
    // 搜索表单事件
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', async e => {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;
        const query = encodeURIComponent(searchInput.value);
        try {
          const res = await fetch(`${API.posts}?search=${query}`);
          if (!res.ok) throw new Error('搜索失败');
          const data = await res.json();
          this.posts = data.posts;
          this.renderPosts();
        } catch (err) {
          this.handleError(err, '搜索失败');
        }
      });
    }
    // 主题切换事件（只绑定一次）
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        console.log('主题切换');
      });
    }
  },

  getCsrfToken() {
  // 从meta标签获取CSRF Token
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  },

  handleError(err, msg) {
    console.error(msg, err);
    alert(msg);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  Forum.init();
});

window.onerror = function(message, source, lineno, colno, error) {
  console.error(`全局错误: ${message}`, error);
};
