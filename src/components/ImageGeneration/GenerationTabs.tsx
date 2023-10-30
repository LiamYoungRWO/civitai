import { Tabs, createStyles, Badge } from '@mantine/core';
import { IconBrush, IconListDetails, IconSlideshow } from '@tabler/icons-react';
import { Feed } from './Feed';
import { Queue } from './Queue';
import {
  useGetGenerationRequests,
  usePollGenerationRequests,
} from '~/components/ImageGeneration/utils/generationRequestHooks';
import { Generate } from '~/components/ImageGeneration/Generate';
import { useGenerationStore } from '~/store/generation.store';
import { useCurrentUser } from '~/hooks/useCurrentUser';

export default function GenerationTabs({}) {
  const { classes } = useStyles();
  const currentUser = useCurrentUser();

  const view = useGenerationStore((state) => state.view);
  const setView = useGenerationStore((state) => state.setView);

  const result = useGetGenerationRequests({}, { enabled: view !== 'generate' });
  const pendingProcessingCount = usePollGenerationRequests(result.requests);

  return (
    <Tabs
      value={view}
      onTabChange={setView}
      variant="pills"
      classNames={classes}
      keepMounted={false}
      inverted
    >
      <Tabs.Panel value="generate" pt={0}>
        <Generate />
      </Tabs.Panel>
      <Tabs.Panel value="queue" py={0}>
        <Queue {...result} />
      </Tabs.Panel>
      <Tabs.Panel value="feed" py={0}>
        <Feed {...result} />
      </Tabs.Panel>

      {currentUser && (
        <Tabs.List grow>
          <Tabs.Tab value="generate" icon={<IconBrush size={16} />} data-autofocus>
            Generate
          </Tabs.Tab>
          <Tabs.Tab value="queue" icon={<IconListDetails size={16} />}>
            Queue{' '}
            {pendingProcessingCount > 0 && (
              <Badge color="red" variant="filled" size="xs">
                {pendingProcessingCount}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="feed" icon={<IconSlideshow size={16} />}>
            Feed
          </Tabs.Tab>
        </Tabs.List>
      )}
    </Tabs>
  );
}

const useStyles = createStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  panel: {
    padding: theme.spacing.md,
    flex: 1,
    overflowY: 'auto',
  },
  tabsList: {
    gap: 0,
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },
  tab: {
    borderRadius: 0,
    flexDirection: 'column',
    gap: '4px',
  },
}));
