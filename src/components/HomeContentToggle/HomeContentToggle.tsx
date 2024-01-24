import {
  Anchor,
  Group,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlProps,
  Tabs,
  TabsProps,
  Text,
  ThemeIcon,
  createStyles,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import {
  IconCalendar,
  IconCategory,
  IconFileText,
  IconHome,
  IconLayoutList,
  IconMoneybag,
  IconPhoto,
  IconVideo,
  TablerIconsProps,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import { containerQuery } from '~/utils/mantine-css-helpers';
import { getDisplayName } from '~/utils/string-helpers';
import { useContainerSmallerThan } from '../ContainerProvider/useContainerSmallerThan';

const homeOptions = {
  home: {
    url: '/',
    icon: (props: TablerIconsProps) => <IconHome {...props} />,
  },
  models: {
    url: '/models',
    icon: (props: TablerIconsProps) => <IconCategory {...props} />,
  },
  images: {
    url: '/images',
    icon: (props: TablerIconsProps) => <IconPhoto {...props} />,
  },
  videos: {
    url: '/videos',
    icon: (props: TablerIconsProps) => <IconVideo {...props} />,
  },
  posts: {
    url: '/posts',
    icon: (props: TablerIconsProps) => <IconLayoutList {...props} />,
  },
  articles: {
    url: '/articles',
    icon: (props: TablerIconsProps) => <IconFileText {...props} />,
  },
  bounties: {
    url: '/bounties',
    icon: (props: TablerIconsProps) => <IconMoneybag {...props} />,
  },
  events: {
    url: '/events',
    icon: (props: TablerIconsProps) => <IconCalendar {...props} />,
  },
} as const;
type HomeOptions = keyof typeof homeOptions;

const useStyles = createStyles<string, { hideActive?: boolean }>((_, params) => ({
  label: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 10,
  },
  active: {
    // Manually adjust the active state to match the design
    marginTop: 4,
    marginLeft: 3,
    borderRadius: 0,
    display: params.hideActive ? 'none' : 'block',
  },
  themeIcon: {
    root: {
      backgroundColor: 'transparent',
    },
  },
  root: {
    backgroundColor: 'transparent',
    gap: 8,
    borderRadius: 0,

    [containerQuery.smallerThan('sm')]: {
      overflow: 'auto hidden',
      maxWidth: '100%',
    },
  },
  control: { border: 'none !important' },
}));

export function useHomeSelection() {
  const [home, setHome] = useLocalStorage<HomeOptions>({
    key: 'home-selection',
    defaultValue: 'home',
  });

  const url = homeOptions[home]?.url;
  const set = (value: HomeOptions) => {
    setHome(value);
    return homeOptions[value]?.url;
  };

  return { home, url, set };
}

export function HomeContentToggle({ size, sx, ...props }: Props) {
  const router = useRouter();
  const { set, home } = useHomeSelection();
  const features = useFeatureFlags();
  const activePath = router.pathname.split('/')[1] || 'home';
  const { classes, theme } = useStyles({ hideActive: activePath !== home });

  const options: SegmentedControlItem[] = Object.entries(homeOptions).map(([key, value]) => ({
    label: (
      <Link href={value.url} passHref>
        <Anchor variant="text">
          <Group
            align="center"
            spacing={8}
            onClick={() => {
              set(key as HomeOptions);
            }}
            noWrap
          >
            <ThemeIcon size={30} color={'transparent'} p={4}>
              {value.icon({
                color:
                  theme.colorScheme === 'dark' || activePath === key
                    ? theme.white
                    : theme.colors.dark[7],
              })}
            </ThemeIcon>
            <Text size="sm" transform="capitalize" inline>
              {key}
            </Text>
          </Group>
        </Anchor>
      </Link>
    ),
    value: key,
    disabled: [key === 'bounties' && !features.bounties, key === 'clubs' && !features.clubs].some(
      (b) => b
    ),
  }));

  return (
    <SegmentedControl
      {...props}
      sx={(theme) => ({
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
      size="md"
      classNames={classes}
      value={activePath}
      data={options.filter((item) => item.disabled === undefined || item.disabled === false)}
    />
  );
}

type Props = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & Omit<SegmentedControlProps, 'data' | 'value' | 'onChange'>;

const useTabsStyles = createStyles(() => ({
  root: {
    overflow: 'auto hidden',
  },
  tab: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 10,

    [containerQuery.smallerThan('md')]: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 10,
      paddingRight: 16,
    },
  },
  tabLabel: {
    [containerQuery.smallerThan('md')]: {
      fontSize: 14,
    },
  },
  tabsList: {
    backgroundColor: 'transparent',
    gap: 8,
    borderRadius: 0,
    flexWrap: 'nowrap',

    [containerQuery.smallerThan('sm')]: {
      maxWidth: '100%',
    },
  },
}));

export function HomeTabs({ sx, ...tabProps }: HomeTabProps) {
  const router = useRouter();
  const { set } = useHomeSelection();
  const features = useFeatureFlags();
  const activePath = router.pathname.split('/')[1] || 'home';
  const { classes, theme } = useTabsStyles();
  const mobile = useContainerSmallerThan('md');

  const tabs = Object.entries(homeOptions)
    .filter(([key]) => ![key === 'bounties' && !features.bounties].some((b) => b))
    .map(([key, value]) => (
      <Link key={key} href={value.url} passHref>
        <Anchor variant="text">
          <Tabs.Tab
            value={key}
            icon={value.icon({
              size: mobile ? 16 : 14,
              color:
                theme.colorScheme === 'dark' || activePath === key
                  ? theme.white
                  : theme.colors.dark[7],
            })}
            onClick={() => {
              set(key as HomeOptions);
            }}
          >
            <Text className={classes.tabLabel} transform="capitalize" inline>
              {getDisplayName(key)}
            </Text>
          </Tabs.Tab>
        </Anchor>
      </Link>
    ));

  return (
    <Tabs
      variant="pills"
      radius="xl"
      defaultValue="home"
      color="gray"
      {...tabProps}
      sx={(theme) => ({
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
      value={activePath}
      classNames={classes}
    >
      <Tabs.List>{tabs}</Tabs.List>
    </Tabs>
  );
}

type HomeTabProps = Omit<TabsProps, 'value' | 'defaultValue' | 'children'>;
