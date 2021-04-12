import React from 'react';
import NextLink from 'next/link';
import renderToString from 'next-mdx-remote/render-to-string';
import hydrate from 'next-mdx-remote/hydrate';
import { Text, Box, Flex, Heading, Separator, Link } from '@modulz/design-system';
import { TitleAndMetaTags } from '@components/TitleAndMetaTags';
import { components } from '@components/MDXComponents';
import { getAllFrontmatter, getAllVersionsFromPath, getDocBySlug } from '@lib/mdx';
import rehypeHighlightCode from '@lib/rehype-highlight-code';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import remarkSlug from 'remark-slug';
import { RemoveScroll } from 'react-remove-scroll';
import { HeroContext } from '@components/HeroSlot';
import { Select } from '@components/Select';

import { QuickNav } from '@components/QuickNav';

import type { PrimitivesFrontmatter } from 'types/primitives';
import type { MdxRemote } from 'next-mdx-remote/types';
import { useRouter } from 'next/router';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CheckIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

type Doc = {
  frontmatter: PrimitivesFrontmatter;
  source: MdxRemote.Source;
};

export default function Doc({ frontmatter, source }: Doc) {
  const content = hydrate(source, { components });
  const heroSlotRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <TitleAndMetaTags
        title={`${frontmatter.title} — Radix UI`}
        description={frontmatter.description}
        poster={frontmatter.poster}
      />

      <Text as="h1" size="8" css={{ fontWeight: 500, mb: '$2', lineHeight: '40px' }}>
        {frontmatter.title}
      </Text>

      <Text
        role="doc-subtitle"
        as="p"
        size="6"
        css={{ mt: '$2', mb: '$4', color: '$slate900', lineHeight: '30px' }}
      >
        {frontmatter.description}
      </Text>

      {frontmatter.version !== frontmatter.versions?.[0] && (
        <Box
          as="aside"
          css={{
            my: '$6',
            py: '$2',
            px: '$3',
            bc: '$yellow100',
            border: '1px solid $yellow400',
            borderRadius: '$2',
            '& p': {
              fontSize: '$3',
              color: '$yellow900',
              lineHeight: '21px',
              margin: 0,
            },
          }}
        >
          <p>
            A newer version of{' '}
            <Box as="span" css={{ fontWeight: 500 }}>
              {frontmatter.title}
            </Box>{' '}
            is available.{' '}
            <NextLink
              href={`/primitives/docs/components/${frontmatter.slug.replace(
                frontmatter.version,
                ''
              )}`}
              passHref
            >
              <Link variant="blue">Learn more</Link>
            </NextLink>
            .
          </p>
        </Box>
      )}

      <div ref={heroSlotRef} />

      <Flex
        css={{
          fd: 'column',
          '@bp1': {
            fd: 'row',
          },
        }}
      >
        <Box
          css={{
            mb: '$5',
            '@bp1': {
              flex: '1 1 100%',
              mr: '$5',
            },
          }}
        >
          {Boolean(frontmatter.features) && (
            <FeatureList>
              {frontmatter.features.map((feature, i) => (
                <Feature key={i}>{feature}</Feature>
              ))}
            </FeatureList>
          )}
        </Box>
        <ComponentInfo
          version={frontmatter.version}
          versions={frontmatter.versions || []}
          name={frontmatter.name}
          aria={frontmatter.aria}
        />
      </Flex>

      <HeroContext.Provider value={heroSlotRef}>
        <Box>{content}</Box>
      </HeroContext.Provider>

      <Box
        as="aside"
        // Components that hide the scrollbar (like Dialog) add padding to
        // account for the scrollbar gap to avoid layout jank. This does not
        // work for position: fixed elements. Since we use react-remove-scroll
        // under the hood for those primitives, we can add this helper class
        // provided by that lib to deal with that for the QuickNav.
        // https://github.com/radix-ui/website/issues/64
        // https://github.com/theKashey/react-remove-scroll#positionfixed-elements
        className={RemoveScroll.classNames.zeroRight}
        css={{
          display: 'none',
          '@bp3': {
            display: 'block',
            width: '250px',
            flexShrink: 0,
            zIndex: 1,
            position: 'fixed',
            right: '$2',
            top: '$5',
            order: 1,
            height: 'calc(100vh - (var(--space-8) + var(--space-5)))',
          },
        }}
      >
        <QuickNav content={content} />
      </Box>
    </>
  );
}

export async function getStaticPaths() {
  const frontmatters = getAllFrontmatter('primitives/docs/components');

  return {
    paths: frontmatters.map((frontmatter) => ({
      params: { slug: frontmatter.slug.replace('primitives/docs/components/', '').split('/') },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { frontmatter, content } = getDocBySlug(
    'primitives/docs/components',
    context.params.slug.join('/')
  );

  const mdxContent = await renderToString(content, {
    components,
    mdxOptions: {
      remarkPlugins: [remarkAutolinkHeadings, remarkSlug],
      rehypePlugins: [rehypeHighlightCode],
    },
  });

  const [componentName, componentVersion] = context.params.slug;

  return {
    props: {
      frontmatter: {
        ...frontmatter,
        version: componentVersion,
        versions: getAllVersionsFromPath(`primitives/docs/components/${componentName}`),
      },
      source: mdxContent,
    },
  };
}

const ComponentInfo = ({ version, versions, name, aria }) => {
  const router = useRouter();

  return (
    <Box css={{ flex: 0, width: '30%' }} as="nav" aria-labelledby="site-component-info-heading">
      <VisuallyHidden as="h2" id="site-component-info-heading">
        Component Reference Links
      </VisuallyHidden>
      <Separator size="2" css={{ mb: '$4', display: 'block', '@bp1': { display: 'none' } }} />
      <Flex css={{ mb: '$4', alignItems: 'baseline' }}>
        <Box css={{ mx: -5 }}>
          <Select value={version} onChange={(e) => router.push(`./${name}/${e.target.value}`)}>
            {versions.map((v, i) => {
              return (
                <option key={v} value={v}>
                  {v}
                  {i === 0 && ' (latest)'}
                </option>
              );
            })}
          </Select>
        </Box>
      </Flex>
      <Separator size="2" css={{ mb: '$4', display: 'none', '@bp1': { display: 'block' } }} />
      <Box css={{ mb: '$2' }}>
        <Link
          variant="blue"
          href={`https://github.com/radix-ui/primitives/tree/main/packages/react/${name}/src`}
          target="_blank"
        >
          <Flex css={{ display: 'inline-flex', position: 'relative' }}>
            <Text size="2" css={{ display: 'inline', lineHeight: '15px' }}>
              View source
            </Text>
            <Box as="span" css={{ ml: '$1', color: '$gray700', position: 'absolute', right: -20 }}>
              <ExternalLinkIcon />
            </Box>
          </Flex>
        </Link>
      </Box>
      <Box css={{ mb: '$2' }}>
        <Link
          variant="blue"
          href={`https://www.npmjs.com/package/@radix-ui/react-${name}`}
          target="_blank"
        >
          <Flex css={{ display: 'inline-flex', position: 'relative' }}>
            <Text size="2" css={{ display: 'inline', lineHeight: '15px' }}>
              View on npm
            </Text>
            <Box as="span" css={{ ml: '$1', color: '$gray700', position: 'absolute', right: -20 }}>
              <ExternalLinkIcon />
            </Box>
          </Flex>
        </Link>
      </Box>
      <Box css={{ mb: '$2' }}>
        <Link
          variant="blue"
          href="https://github.com/radix-ui/primitives/issues/new/choose"
          target="_blank"
        >
          <Flex css={{ display: 'inline-flex', position: 'relative' }}>
            <Text size="2" css={{ display: 'inline', lineHeight: '15px' }}>
              Report an issue
            </Text>
            <Box as="span" css={{ ml: '$1', color: '$gray700', position: 'absolute', right: -20 }}>
              <ExternalLinkIcon />
            </Box>
          </Flex>
        </Link>
      </Box>
      {aria && (
        <Box css={{ mb: '$2' }}>
          <Link variant="blue" href={aria} target="_blank">
            <Flex css={{ display: 'inline-flex', position: 'relative' }}>
              <Text size="2" css={{ display: 'inline', lineHeight: '15px' }}>
                ARIA design pattern
              </Text>
              <Box
                as="span"
                css={{ ml: '$1', color: '$gray700', position: 'absolute', right: -20 }}
              >
                <ExternalLinkIcon />
              </Box>
            </Flex>
          </Link>
        </Box>
      )}
    </Box>
  );
};

const FeatureList = ({ children }) => (
  <Box>
    <Heading css={{ mb: '$4' }} as={'h2' as any}>
      Features
    </Heading>
    <Box as="ul" css={{ p: 0, m: 0 }}>
      {children}
    </Box>
  </Box>
);

const Feature = ({ children, ...props }) => (
  <Flex as="li" {...props} css={{ mt: '$2' }}>
    <Box
      css={{
        width: '25px',
        height: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '$green200',
        borderRadius: '50%',
        color: '$green900',
        marginRight: '15px',
        flexShrink: 0,
      }}
    >
      <CheckIcon />
    </Box>
    <Text size="3" css={{ lineHeight: '25px' }}>
      {children}
    </Text>
  </Flex>
);