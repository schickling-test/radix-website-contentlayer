import { components, MDXProvider } from '@components/MDXComponents';
import compareVersions from 'compare-versions';
import { getMDXComponent } from 'mdx-bundler/client';
import Head from 'next/head';
import type { FC } from 'react';
import { useMemo } from 'react';

import { allPosts } from '.contentlayer/data';
import type { Post } from '.contentlayer/types';

export const getStaticPaths = () => {
  const paths = allPosts.map((_) => `/docs/${_._raw.flattenedPath}`);

  return { paths, fallback: false };
};

export const getStaticProps = (context: any) => {
  const post = allPosts.find((_) => _._raw.flattenedPath === context.params.id.join('/'));
  const versions = allPosts
    .filter((_) => _._raw.sourceFileDir === post._raw.sourceFileDir)
    .map((_) => _._raw.sourceFileName.replace(/\.mdx$/, ''))
    .sort(compareVersions)
    .reverse();

  return { props: { post, versions } };
};

const Page: FC<{ post: Post; versions: string[] }> = ({ post, versions }) => {
  const Component = useMemo(() => getMDXComponent(post.content.code), [post.content.code]);
  return (
    <>
      <Head>
        <title>{post._id}</title>
      </Head>
      <MDXProvider frontmatter={{ versions }}>
        <Component components={components} />
      </MDXProvider>
    </>
  );
};

export default Page;
