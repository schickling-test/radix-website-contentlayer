import React from 'react';
import { Box, Button } from '@modulz/design-system';
import { Pre } from './Pre';

export function DocCodeBlock({
  className,
  children,
  id,
  showLineNumbers = false,
  collapsed = false,
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  return (
    <>
      {collapsed && (
        <Box
          data-code-toggle
          css={{
            p: '$3',
            mt: 1,
            boxShadow: '0 0 0 1px $colors$slate500',
            textAlign: 'right',
            ...(isCollapsed ? { borderBottomLeftRadius: '$3', borderBottomRightRadius: '$3' } : {}),
          }}
        >
          <Button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? 'Show' : 'Hide'} code
          </Button>
        </Box>
      )}
      <Pre
        as="pre"
        css={{
          my: '$5',
          ...(isCollapsed ? { display: 'none' } : {}),
          '[data-preview] + &, [data-code-toggle] + &': {
            marginTop: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
        }}
        className={className}
        id={id}
        data-line-numbers={showLineNumbers}
      >
        <code className={className} children={children} />
      </Pre>
    </>
  );
}
