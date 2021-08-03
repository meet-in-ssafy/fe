import { Story } from '@storybook/react';
import TeamStatus from './TeamStatus';

export default {
  title: 'Organisms/Team Status',
  component: TeamStatus,
};

const TEAMPAGE_CARD_DUMMY_DATA = [
  {
    members: [
      {
        profileSrc: '/profile.png',
        name: '이용재',
        leader: true,
      },
      {
        profileSrc: '/profile.png',
        name: '장동균',
        leader: false,
      },
      {
        profileSrc: '/profile.png',
        name: '장민호',
        leader: false,
      },
    ],
    skills: ['React', 'Spring', 'MySQL'],
    track: '웹기술',
    description:
      '저희 팀의 목표는 1등입니다. 자신있는 벡엔드 개발자 DM주세요. 다들 화이팅입니다 👏👏👏',
    isCompleted: false,
  },
  {
    members: [
      {
        profileSrc: '/profile.png',
        name: '강승현',
        leader: true,
      },
      {
        profileSrc: '/profile.png',
        name: '안석현',
        leader: false,
      },
      {
        profileSrc: '/profile.png',
        name: '이동길',
        leader: false,
      },
      {
        profileSrc: '/profile.png',
        name: '현선미',
        leader: false,
      },
    ],
    skills: ['Spring', 'STOMP', 'JPA'],
    track: '웹기술',
    description: '🔥🔥월화수목금금금🔥🔥 보내실 프론트엔드 구합니다. ',
    isCompleted: true,
  },
];

const Template: Story = ({teams}) => <TeamStatus teams={teams} />;

export const teamStatus = Template.bind({});

teamStatus.args = {
  teams: TEAMPAGE_CARD_DUMMY_DATA,
};
