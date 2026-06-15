require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../configs/mongodb.config");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const Follow = require("../models/follow.model");
const { BCRYPT_SALT_ROUNDS } = require("../configs/env.config");

const SEED_PASSWORD = "Password123";
const SEED_EMAIL_DOMAIN = "@seed.linkora";

const seedUsers = [
  {
    fullname: "Alex Chen",
    username: "alex_chen",
    email: `alex_chen${SEED_EMAIL_DOMAIN}`,
    gender: "male",
    bio: "Street photographer. Chasing light and quiet moments.",
    profilePicture: "https://i.pravatar.cc/150?img=12",
    coverPicture: "https://picsum.photos/seed/linkora-cover-1/1200/400",
  },
  {
    fullname: "Maya Jones",
    username: "maya_jones",
    email: `maya_jones${SEED_EMAIL_DOMAIN}`,
    gender: "female",
    bio: "Product designer. Minimal UI, bold ideas.",
    profilePicture: "https://i.pravatar.cc/150?img=32",
    coverPicture: "https://picsum.photos/seed/linkora-cover-2/1200/400",
  },
  {
    fullname: "Jordan Lee",
    username: "jordan_lee",
    email: `jordan_lee${SEED_EMAIL_DOMAIN}`,
    gender: "male",
    bio: "Full-stack dev building things that feel simple.",
    profilePicture: "https://i.pravatar.cc/150?img=15",
    coverPicture: "https://picsum.photos/seed/linkora-cover-3/1200/400",
  },
  {
    fullname: "Sara Kim",
    username: "sara_kim",
    email: `sara_kim${SEED_EMAIL_DOMAIN}`,
    gender: "female",
    bio: "Travel notes, coffee stops, and late trains.",
    profilePicture: "https://i.pravatar.cc/150?img=47",
    coverPicture: "https://picsum.photos/seed/linkora-cover-4/1200/400",
  },
  {
    fullname: "Chris Rivera",
    username: "chris_rivera",
    email: `chris_rivera${SEED_EMAIL_DOMAIN}`,
    gender: "male",
    bio: "Home cook. Always testing a new recipe.",
    profilePicture: "https://i.pravatar.cc/150?img=8",
    coverPicture: "https://picsum.photos/seed/linkora-cover-5/1200/400",
  },
  {
    fullname: "Demo User",
    username: "demo",
    email: `demo${SEED_EMAIL_DOMAIN}`,
    gender: "female",
    bio: "Linkora demo account — explore the feed and profiles.",
    profilePicture: "https://i.pravatar.cc/150?img=5",
    coverPicture: "https://picsum.photos/seed/linkora-cover-6/1200/400",
  },
];

const followPairs = [
  ["demo", "alex_chen"],
  ["demo", "maya_jones"],
  ["demo", "sara_kim"],
  ["alex_chen", "maya_jones"],
  ["maya_jones", "jordan_lee"],
  ["jordan_lee", "alex_chen"],
  ["sara_kim", "chris_rivera"],
  ["chris_rivera", "sara_kim"],
  ["maya_jones", "sara_kim"],
];

const seedPosts = [
  {
    author: "alex_chen",
    text: "Golden hour never misses. Shot this on the walk home.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-1/800/800", resource_type: "image" }],
    likes: ["maya_jones", "demo"],
  },
  {
    author: "maya_jones",
    text: "New sidebar layout exploration — cleaner spacing, fewer borders.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-2/800/800", resource_type: "image" }],
    likes: ["jordan_lee", "alex_chen"],
  },
  {
    author: "jordan_lee",
    text: "Shipped a small refactor today. The best code is the one your future self understands.",
    likes: ["maya_jones"],
  },
  {
    author: "sara_kim",
    text: "Morning market run. The city feels different before 8am.",
    files: [
      { url: "https://picsum.photos/seed/linkora-post-3/800/800", resource_type: "image" },
      { url: "https://picsum.photos/seed/linkora-post-4/800/800", resource_type: "image" },
    ],
    likes: ["demo", "chris_rivera", "maya_jones"],
  },
  {
    author: "chris_rivera",
    text: "Tried a one-pan lemon garlic pasta. 10/10 would make again.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-5/800/800", resource_type: "image" }],
    likes: ["sara_kim", "demo"],
  },
  {
    author: "demo",
    text: "Welcome to Linkora! This is a seeded demo post — follow people and explore the feed.",
    likes: ["alex_chen", "maya_jones"],
  },
  {
    author: "alex_chen",
    text: "Rainy day edit session. Sometimes the mood makes the photo.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-6/800/800", resource_type: "image" }],
    likes: ["jordan_lee"],
  },
  {
    author: "maya_jones",
    text: "Design tip: if everything is emphasized, nothing is.",
    likes: ["demo", "sara_kim", "jordan_lee"],
  },
  {
    author: "jordan_lee",
    text: "Weekend hackathon energy. Coffee count: unreasonable.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-7/800/800", resource_type: "image" }],
    likes: ["alex_chen"],
  },
  {
    author: "sara_kim",
    text: "Train window views hit different when you're not in a rush.",
    likes: ["maya_jones", "demo"],
  },
  {
    author: "chris_rivera",
    text: "Farmers market haul. Tomatoes this good shouldn't be legal.",
    files: [
      { url: "https://picsum.photos/seed/linkora-post-8/800/800", resource_type: "image" },
      { url: "https://picsum.photos/seed/linkora-post-9/800/800", resource_type: "image" },
    ],
    likes: ["sara_kim"],
  },
  {
    author: "demo",
    text: "Saved posts, stories, and notifications are all wired up. Try them out.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-10/800/800", resource_type: "image" }],
    likes: ["chris_rivera", "jordan_lee"],
  },
  {
    author: "alex_chen",
    text: "Late-night walk through empty streets. The city hums differently after midnight.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-11/800/800", resource_type: "image" }],
    likes: ["demo", "sara_kim"],
  },
  {
    author: "maya_jones",
    text: "Rounded corners debate: team split 50/50. We compromised on rounded-xl.",
    likes: ["jordan_lee", "alex_chen"],
  },
  {
    author: "jordan_lee",
    text: "Finally fixed that race condition. Three lines changed, two hours spent.",
    likes: ["maya_jones", "demo"],
  },
  {
    author: "sara_kim",
    text: "Found a tiny bookstore with the best postcards. Added three to the collection.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-12/800/800", resource_type: "image" }],
    likes: ["chris_rivera", "maya_jones"],
  },
  {
    author: "chris_rivera",
    text: "Sourdough day. The kitchen smells like patience.",
    files: [
      { url: "https://picsum.photos/seed/linkora-post-13/800/800", resource_type: "image" },
      { url: "https://picsum.photos/seed/linkora-post-14/800/800", resource_type: "image" },
    ],
    likes: ["demo", "sara_kim", "alex_chen"],
  },
  {
    author: "demo",
    text: "Explore page is live — check trending posts from the community.",
    likes: ["maya_jones", "jordan_lee", "sara_kim"],
  },
  {
    author: "alex_chen",
    text: "Testing a new lens today. Sharpness on point, wallet on pause.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-15/800/800", resource_type: "image" }],
    likes: ["maya_jones"],
  },
  {
    author: "maya_jones",
    text: "White space is not wasted space.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-16/800/800", resource_type: "image" }],
    likes: ["demo", "jordan_lee"],
  },
  {
    author: "jordan_lee",
    text: "Pushed to prod on a Friday. Living dangerously.",
    likes: ["alex_chen", "chris_rivera"],
  },
  {
    author: "sara_kim",
    text: "Sunset from the rooftop. No filter needed.",
    files: [{ url: "https://picsum.photos/seed/linkora-post-17/800/800", resource_type: "image" }],
    likes: ["demo", "alex_chen", "maya_jones"],
  },
  {
    author: "chris_rivera",
    text: "Meal prep Sunday: grain bowls for the whole week.",
    likes: ["sara_kim", "jordan_lee"],
  },
];

async function clearSeedData() {
  const seedEmails = seedUsers.map((user) => user.email);
  const existingUsers = await User.find({ email: { $in: seedEmails } }).select("_id");
  const userIds = existingUsers.map((user) => user._id);

  if (userIds.length === 0) return;

  await Post.deleteMany({ author: { $in: userIds } });
  await Follow.deleteMany({
    $or: [{ follower: { $in: userIds } }, { following: { $in: userIds } }],
  });
  await User.deleteMany({ _id: { $in: userIds } });
}

async function upsertUsers(hashedPassword) {
  const byUsername = {};

  for (const seedUser of seedUsers) {
    let user = await User.findOne({ email: seedUser.email });

    if (!user) {
      user = await User.create({
        ...seedUser,
        password: hashedPassword,
        isVerified: true,
        followers: [],
        following: [],
      });
      console.log(`Created user @${user.username}`);
    } else {
      user.set({
        fullname: seedUser.fullname,
        bio: seedUser.bio,
        profilePicture: seedUser.profilePicture,
        coverPicture: seedUser.coverPicture,
        isVerified: true,
      });
      await user.save();
      console.log(`Updated user @${user.username}`);
    }

    byUsername[seedUser.username] = user;
  }

  return byUsername;
}

async function loadSeedUsers() {
  const byUsername = {};
  for (const seedUser of seedUsers) {
    const user = await User.findOne({ email: seedUser.email });
    if (user) byUsername[seedUser.username] = user;
  }
  return byUsername;
}

async function seedFollows(usersByUsername) {
  for (const [followerUsername, followingUsername] of followPairs) {
    const follower = usersByUsername[followerUsername];
    const following = usersByUsername[followingUsername];

    if (!follower || !following) continue;

    const exists = await Follow.findOne({
      follower: follower._id,
      following: following._id,
    });

    if (exists) continue;

    await Follow.create({
      follower: follower._id,
      following: following._id,
    });

    await Promise.all([
      User.findByIdAndUpdate(following._id, {
        $addToSet: { followers: follower._id },
      }),
      User.findByIdAndUpdate(follower._id, {
        $addToSet: { following: following._id },
      }),
    ]);
  }

  console.log(`Seeded ${followPairs.length} follow relationships`);
}

async function seedPostsData(usersByUsername) {
  let created = 0;

  for (const seedPost of seedPosts) {
    const author = usersByUsername[seedPost.author];
    if (!author) continue;

    const exists = await Post.findOne({
      author: author._id,
      text: seedPost.text,
    });

    if (exists) continue;

    const likes = (seedPost.likes || [])
      .map((username) => usersByUsername[username]?._id)
      .filter(Boolean);

    await Post.create({
      author: author._id,
      text: seedPost.text,
      files: (seedPost.files || []).map((file, index) => ({
        url: file.url,
        public_id: `seed-${seedPost.author}-${index}`,
        resource_type: file.resource_type || "image",
      })),
      likes,
    });

    created += 1;
  }

  console.log(`Created ${created} posts (${seedPosts.length} defined in seed)`);
}

async function main() {
  const fresh = process.argv.includes("--fresh");
  const postsOnly = process.argv.includes("--posts-only");

  await connectDB();

  if (fresh) {
    console.log("Removing existing seed users and their data...");
    await clearSeedData();
  }

  let usersByUsername;

  if (postsOnly) {
    usersByUsername = await loadSeedUsers();
    if (Object.keys(usersByUsername).length === 0) {
      throw new Error("No seed users found. Run npm run seed first.");
    }
    await seedPostsData(usersByUsername);
    console.log("");
    console.log("Posts seed complete.");
    return;
  }

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);
  usersByUsername = await upsertUsers(hashedPassword);
  await seedFollows(usersByUsername);
  await seedPostsData(usersByUsername);

  console.log("");
  console.log("Seed complete.");
  console.log(`Login with any seed account, e.g. demo${SEED_EMAIL_DOMAIN}`);
  console.log(`Password: ${SEED_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
