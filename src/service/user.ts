import { ProfileUser } from "@/model/user";
import { client } from "./sanity";

type OAuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  username: string;
};

export async function addUser({ id, name, username, email, image }: OAuthUser) {
  // console.log("add user");
  return client.createIfNotExists({
    _id: id,
    _type: "user",
    username,
    email,
    name,
    image,
    following: [],
    followers: [],
    bookmarks: [],
  });
}

export async function getUserByUsername(username: string) {
  return client.fetch(
    `*[_type=='user' && username == '${username}'][0]{
    ...,
    'id':_id,
    following[]->{username,image},
    followers[]->{username,image},
    'bookmarks':bookmarks[]->_id
  }`,
  );
}

export async function searchUsers(keyword?: string) {
  const query = keyword
    ? `&& (name match "*${keyword}*") || (username match "*${keyword}*")`
    : "";
  // ${keyword}를 *로 감싸서 포함된 내용까지 검색하게끔 할 수 있음
  // name match "${keyword}" 는 전체 문자열이 완전히 일치하는 값만 검색

  return client
    .fetch(
      `*[_type == 'user' ${query}]{
      ...,
      'following': count(following),
      'followers': count(followers),
    }
    `,
    )
    .then((users) =>
      users.map((user: ProfileUser) => ({
        ...user,
        following: user.following ?? 0,
        followers: user.followers ?? 0,
      })),
    );
}
