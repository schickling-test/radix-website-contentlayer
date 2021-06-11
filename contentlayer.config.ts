import rehypeHighlightCode from '@lib/rehype-highlight-code';
import rehypeMetaAttribute from '@lib/rehype-meta-attribute';
import { defineDocument, fromLocalContent } from 'contentlayer/source-local';
import remarkSlug from 'remark-slug';

export const Post = defineDocument(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  fileType: 'mdx',
  fields: {
    metaTitle: {
      type: 'string',
      required: true,
    },
    metaDescription: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: false,
    },
    aria: {
      type: 'url',
      required: false,
    },
    publishedName: {
      type: 'string',
      required: false,
    },
    features: {
      type: 'list',
      of: { type: 'string' },
      required: false,
    },
  },
}));

export default fromLocalContent({
  contentDirPath: 'data',
  schema: [Post],
  mdx: {
    remarkPlugins: [remarkSlug],
    rehypePlugins: [rehypeMetaAttribute, rehypeHighlightCode],
  },
});
