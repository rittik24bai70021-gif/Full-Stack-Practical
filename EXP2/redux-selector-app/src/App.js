import { useMemo, useState } from "react";
import "./App.css";

import PostList from "./components/PostList";
import {
  selectTotalPosts,
  selectFacebookPosts,
  selectInstagramPosts,
  selectLinkedInPosts,
  selectTwitterPosts,
} from "./selectors/postSelectors";

const initialPosts = [
  {
    id: 1,
    title: "Rittik Basak",
    platform: "Instagram",
  },
  {
    id: 2,
    title: "24BAI70021",
    platform: "Twitter",
  },
];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Facebook");

  const totalPosts = useMemo(
    () => selectTotalPosts(posts),
    [posts]
  );

  const facebookPosts = useMemo(
    () => selectFacebookPosts(posts),
    [posts]
  );

  const instagramPosts = useMemo(
    () => selectInstagramPosts(posts),
    [posts]
  );

  const linkedInPosts = useMemo(
    () => selectLinkedInPosts(posts),
    [posts]
  );

  const twitterPosts = useMemo(
    () => selectTwitterPosts(posts),
    [posts]
  );

  const handleAddPost = () => {
    if (title.trim() === "") {
      alert("Please enter a post title");
      return;
    }

    const newPost = {
      id: Date.now(),
      title: title,
      platform: platform,
    };

    setPosts((currentPosts) => [
      ...currentPosts,
      newPost,
    ]);

    setTitle("");
    setPlatform("Facebook");
  };

  const handleDelete = (id) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== id)
    );
  };

  return (
    <div className="app-container">

      <h1 className="app-title">
        Redux Selector Demo
      </h1>

      <div className="form-group">
        <label>Post Title</label>

        <input
          type="text"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Platform</label>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option>Facebook</option>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Twitter</option>
        </select>
      </div>

      <button
        className="add-post-btn"
        onClick={handleAddPost}
      >
        Add Post
      </button>

      <h2 className="section-title">
        Derived State (Memoized Selectors)
      </h2>

      <div className="derived-state">
        <p>Total Posts: {totalPosts}</p>
        <p>Facebook Posts: {facebookPosts}</p>
        <p>Instagram Posts: {instagramPosts}</p>
        <p>LinkedIn Posts: {linkedInPosts}</p>
        <p>Twitter Posts: {twitterPosts}</p>
      </div>

      <h2 className="section-title">
        All Posts
      </h2>

      <PostList
        posts={posts}
        onDelete={handleDelete}
      />

    </div>
  );
}

export default App;