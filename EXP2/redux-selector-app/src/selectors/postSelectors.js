export const selectTotalPosts = (posts) => {
  return posts.length;
};

export const selectFacebookPosts = (posts) => {
  return posts.filter(
    (post) => post.platform === "Facebook"
  ).length;
};

export const selectInstagramPosts = (posts) => {
  return posts.filter(
    (post) => post.platform === "Instagram"
  ).length;
};

export const selectLinkedInPosts = (posts) => {
  return posts.filter(
    (post) => post.platform === "LinkedIn"
  ).length;
};

export const selectTwitterPosts = (posts) => {
  return posts.filter(
    (post) => post.platform === "Twitter"
  ).length;
};