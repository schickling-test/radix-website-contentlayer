import type { InferGetStaticPropsType } from 'next';
import type { FC } from 'react';

import { allPosts } from '.contentlayer/data';

export const getStaticProps = async () => {
  const posts = allPosts.map((_) => ({ path: _._raw.flattenedPath, ..._ }));

  return { props: { posts } };
};

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ posts }) => (
  <div>
    {posts.map((doc) => (
      <a style={{ display: 'block' }} key={doc.path} href={`/docs/${doc.path}`}>
        {doc.metaTitle}
      </a>
    ))}
  </div>
);

export default Page;
