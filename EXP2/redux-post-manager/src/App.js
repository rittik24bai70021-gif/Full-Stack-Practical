import { useMemo, useState } from "react";
import "./App.css";

const initialPosts = [
  {
    id: 1,
    title: "Getting Started with Redux Toolkit",
    content:
      "Redux Toolkit provides a simple and organized way to manage application state in React projects.",
    author: "Rittik Basak",
    createdAt: "20 July 2026",
  },
  {
    id: 2,
    title: "Why Use React Components?",
    content:
      "Components help divide a user interface into small, reusable, and manageable sections.",
    author: "Admin",
    createdAt: "19 July 2026",
  },
];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [message, setMessage] = useState("");

  const filteredPosts = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    if (!searchValue) {
      return posts;
    }

    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchValue) ||
        post.content.toLowerCase().includes(searchValue) ||
        post.author.toLowerCase().includes(searchValue)
      );
    });
  }, [posts, searchTerm]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setAuthor("");
    setEditingPostId(null);
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedTitle = title.trim();
    const cleanedContent = content.trim();
    const cleanedAuthor = author.trim();

    if (!cleanedTitle || !cleanedContent || !cleanedAuthor) {
      showMessage("Please complete all fields.");
      return;
    }

    if (editingPostId !== null) {
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === editingPostId
            ? {
                ...post,
                title: cleanedTitle,
                content: cleanedContent,
                author: cleanedAuthor,
              }
            : post
        )
      );

      showMessage("Post updated successfully.");
    } else {
      const newPost = {
        id: Date.now(),
        title: cleanedTitle,
        content: cleanedContent,
        author: cleanedAuthor,
        createdAt: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      setPosts((currentPosts) => [newPost, ...currentPosts]);
      showMessage("Post published successfully.");
    }

    resetForm();
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    setEditingPostId(post.id);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId)
    );

    if (editingPostId === postId) {
      resetForm();
    }

    showMessage("Post deleted successfully.");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-content">
          <div className="brand">
            <div className="brand-icon">R</div>

            <div>
              <h1>Redux Post Manager</h1>
              <p>Organize and manage your posts easily</p>
            </div>
          </div>

          <div className="post-counter">
            <span>{posts.length}</span>
            <p>{posts.length === 1 ? "Post" : "Posts"}</p>
          </div>
        </div>
      </header>

      <main className="main-container">
        {message && <div className="notification">{message}</div>}

        <section className="dashboard-grid">
          <div className="form-card">
            <div className="section-heading">
              <div>
                <span className="section-label">
                  {editingPostId !== null ? "Editing mode" : "Create post"}
                </span>

                <h2>
                  {editingPostId !== null
                    ? "Update your post"
                    : "Share something new"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Post title</label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  maxLength="80"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter an interesting post title"
                />

                <span className="character-count">
                  {title.length}/80 characters
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="author">Author name</label>

                <input
                  id="author"
                  type="text"
                  value={author}
                  maxLength="40"
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Enter the author name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Post content</label>

                <textarea
                  id="content"
                  value={content}
                  maxLength="500"
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your post content here..."
                  rows="8"
                />

                <span className="character-count">
                  {content.length}/500 characters
                </span>
              </div>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  {editingPostId !== null ? "Update Post" : "Publish Post"}
                </button>

                {editingPostId !== null && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <section className="posts-section">
            <div className="posts-header">
              <div>
                <span className="section-label">Post collection</span>
                <h2>Recent posts</h2>
              </div>

              <div className="search-box">
                <span className="search-icon">⌕</span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search posts..."
                  aria-label="Search posts"
                />
              </div>
            </div>

            <div className="posts-list">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <article className="post-card" key={post.id}>
                    <div className="post-card-top">
                      <div className="author-avatar">
                        {post.author.charAt(0).toUpperCase()}
                      </div>

                      <div className="post-meta">
                        <strong>{post.author}</strong>
                        <span>{post.createdAt}</span>
                      </div>
                    </div>

                    <h3>{post.title}</h3>
                    <p className="post-content">{post.content}</p>

                    <div className="post-actions">
                      <button
                        className="edit-button"
                        type="button"
                        onClick={() => handleEdit(post)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No posts found</h3>
                  <p>
                    Try another search or create your first post using the
                    form.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>

      <footer className="footer">
        <p>Redux Post Manager • Created by Rittik Basak</p>
      </footer>
    </div>
  );
}

export default App;