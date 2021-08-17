import { ReactElement, useState, useEffect } from 'react';
import styled from 'styled-components';
import { OptionsType, OptionTypeBase } from 'react-select';

import { UserStatusCard, LookupLayout } from '@organisms';
import {
  Filter,
  UserSelectAutoComplete,
  SimpleSelect,
  Title,
  Button,
  Pagination,
} from '@molecules';
import { Icon, Text } from '@atoms';

import useSockStomp from '@hooks/useSockStomp';

import {
  getEachFiltersCodeList,
  postByFilteredUsers,
} from '@repository/filterRepository';
import { useAppDispatch, useAuthState, displayModal } from '@store';
import { FILTER_TITLE } from '@utils/constants';
import { MemberOption } from '@utils/type';
import { ModalWrapper } from '@organisms';
import { getUserHasTeam } from '@repository/teamRepository';
import { MODALS } from '@utils/constants';

interface Users {
  id: number;
  introduce: string;
  name: string;
  skillList: string[];
  trackList: string[];
}

const sortByOptions: OptionsType<OptionTypeBase> = [
  {
    label: '이름',
    value: 'name',
  },
];

const WrapFilter = styled.div`
  padding: 10px;
  margin: 10px;
  background-color: white;
  > div > div {
    width: 100%;
  }
`;

const InviteConfirmModal = styled.div`
  position: relative;
  padding: 50px;

  .modal-header {
    text-align: center;

    .close-btn {
      position: absolute;
      right: 10px;
      top: 10px;

      i {
        font-size: 30px;
        cursor: pointer;
      }
    }
  }

  .modal-content {
    text-align: center;
    margin: 20px 0;
  }

  .modal-footer {
    text-align: center;
    margin-top: 30px;

    > button:nth-child(1) {
      margin-right: 20px;
    }
    > button:nth-child(2) {
      background-color: deeppink;
    }
  }
`;

export default function UserStatus(): ReactElement {
  const {
    user: { id, projectCodes, studentNumber },
  } = useAuthState();

  const { handleSendInvitation, handleSendRtcLink } = useSockStomp({
    room_id: 0,
  });
  const [filterContents, setFilterContents] = useState<any>();
  const [payload, setPayload] = useState({});

  const [users, setUsers] = useState([]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedUser, setInvitedUser] = useState<Users>();
  const [isLeader, setIsLeader] = useState(false);
  const [teamId, setTeamId] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const {
        data: { data },
      } = await getEachFiltersCodeList(studentNumber);

      setFilterContents(data);
    })();

    const project = projectCodes[projectCodes.length - 1];

    setPayload({
      project,
      studentNumber,
      sort: 'asc',
      pageNum: 0,
      pageSize: 10,
    });

    if (project) {
      getUserHasTeam({
        userId: id,
        project: { code: project },
      }).then(({ data: { data } }) => {
        if (data.hasTeam) {
          if (data.team.leaderId === id) {
            setTeamId(data.team.id);
            setIsLeader(true);
          }
        }
      });
    } else {
      dispatch(
        displayModal({
          modalName: MODALS.ALERT_MODAL,
          content: '관리자에게 프로젝트 멤버 등록을 요청해주세요',
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (
      payload.hasOwnProperty('studentNumber') &&
      payload.hasOwnProperty('project')
    ) {
      (async () => {
        try {
          const {
            data: {
              data: { dataList, totPageCnt },
            },
          } = await postByFilteredUsers(payload);

          setUsers(dataList);
          setPageCount(totPageCnt);
        } catch ({
          response: {
            data: { errorMessage },
          },
          status,
        }) {
          setUsers([]);
          // if (errorMessage === '일치하는 유저가 없습니다') {
          //   setUsers([]);
          // }
        }
      })();
    }
  }, [payload]);

  const handleToggleFilter = (title: string, code: string) => {
    if (code === '전체') {
      const payloadTemp: any = { ...payload, pageNum: 0, sort: 'asc' };
      delete payloadTemp[FILTER_TITLE[title]];
      return setPayload(payloadTemp);
    }

    setPayload((prev) => ({
      ...prev,
      [FILTER_TITLE[title]]: code,
      pageNum: 0,
      sort: 'asc',
    }));
  };

  const handleFilter = (title: string, code: string) => {
    const payloadTemp: any = { ...payload, pageNum: 0, sort: 'asc' };
    const convertTitle: any = FILTER_TITLE[title];

    if (!payloadTemp.hasOwnProperty(convertTitle)) {
      payloadTemp[convertTitle] = [];
    }

    if (payloadTemp[convertTitle].includes(code)) {
      payloadTemp[convertTitle].splice(
        payloadTemp[convertTitle].indexOf(code),
        1,
      );
    } else {
      payloadTemp[convertTitle].push(code);
    }

    setPayload(payloadTemp);
  };

  const handleFilterArray = (title: string, arr: any) => {
    const payloadTemp: any = { ...payload, pageNum: 0, sort: 'asc' };
    const convertTitle: any = FILTER_TITLE[title];

    if (arr.length === 0) {
      delete payloadTemp[FILTER_TITLE[title]];
    } else {
      payloadTemp[convertTitle] = arr.reduce(
        (acc, cur) => [...acc, cur.value],
        [],
      );
    }

    setPayload(payloadTemp);
  };

  const handleChangeUserSelect = (selectedUser: MemberOption | null) => {
    if (selectedUser?.email) {
      return setPayload((prev) => ({
        ...prev,
        email: selectedUser?.email,
        pageNum: 0,
        sort: 'asc',
      }));
    }

    const payloadTemp: any = { ...payload, pageNum: 0, sort: 'asc' };

    delete payloadTemp.email;
    setPayload(payloadTemp);
  };

  const handleProjectChange = ({ value }: { value: number }) => {
    if (projectCodes?.includes(value)) {
      setPayload((prev) => ({
        ...prev,
        project: value,
        pageNum: 0,
        sort: 'asc',
      }));
    }
  };

  const handleClickSort = (sort: string) => {
    setPayload((prev) => ({ ...prev, sort, pageNum: 0 }));
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInvitedUser(undefined);
  };

  const handleClickInviteIcon = (selectedUser: Users) => {
    setShowInviteModal(true);
    setInvitedUser(selectedUser);
  };

  const handleInvite = async () => {
    if (!invitedUser) {
      dispatch(
        displayModal({
          modalName: MODALS.ALERT_MODAL,
          content: `알 수 없는 에러가 발생했습니다. 새로고침한 후 다시 시도해주세요.`,
        }),
      );
      return;
    }

    handleSendInvitation(teamId, id, invitedUser.id);

    setShowInviteModal(false);
    setPayload((prev) => ({ ...prev }));
  };

  return (
    <LookupLayout showTeamCreateBtn={false}>
      <div className="filter-container">
        {filterContents && (
          <WrapFilter>
            <Title title="프로젝트">
              <SimpleSelect
                options={filterContents['프로젝트']
                  .slice(0, projectCodes?.length)
                  .reduce(
                    (acc, { codeName, code }) => [
                      ...acc,
                      { label: codeName, value: code },
                    ],
                    [],
                  )}
                onChange={handleProjectChange}
                value={{
                  label:
                    filterContents['프로젝트'][projectCodes?.length - 1]
                      ?.codeName,
                  value:
                    filterContents['프로젝트'][projectCodes?.length - 1]?.code,
                }}
              />
            </Title>
          </WrapFilter>
        )}
        {filterContents &&
          Object.keys(filterContents).map(
            (each) =>
              each !== '기수' &&
              each !== '프로젝트' &&
              (each !== '전공/비전공' ? (
                filterContents[each].length < 5 ? (
                  <Filter
                    title={each}
                    contents={filterContents[each]}
                    func={handleFilter}
                    key={`filter-checkbox-${each}`}
                  />
                ) : (
                  <Filter
                    title={each}
                    contents={filterContents[each]}
                    func={handleFilterArray}
                    key={`filter-selectbox-${each}`}
                  />
                )
              ) : (
                <Filter
                  title={each}
                  contents={filterContents[each]}
                  func={handleToggleFilter}
                  key={`filter-radiobutton-${each}`}
                  isRadioButton
                />
              )),
          )}
      </div>
      <div className="team-status-list-container">
        <WrapFilter>
          <div className="team-status-header">
            <UserSelectAutoComplete
              handleChangeUserSelect={handleChangeUserSelect}
              payload={payload}
            />
            <div className="sort-container">
              <div className="sort-select">
                <SimpleSelect
                  options={sortByOptions}
                  placeholder={'Sort by...'}
                  value={sortByOptions[0]}
                />
              </div>
              <span
                className={
                  'sort-icon' + (payload?.sort === 'asc' ? ' rotated' : '')
                }
              >
                <Icon
                  iconName="sort"
                  func={() =>
                    handleClickSort(payload?.sort === 'asc' ? 'desc' : 'asc')
                  }
                />
              </span>
            </div>
          </div>
        </WrapFilter>

        {(users && users.length) === 0 ? (
          <WrapFilter>일치하는 유저가 없습니다.</WrapFilter>
        ) : (
          <>
            {users?.map((each: Users) => (
              <UserStatusCard
                key={`status-card-${each?.id}`}
                user={each}
                filterContents={filterContents}
                id={id}
                onClickInviteIcon={() => handleClickInviteIcon(each)}
                currentUserIsLeader={isLeader}
                handleSendRtcLink={handleSendRtcLink}
              />
            ))}
            {pageCount >= 0 && (
              <Pagination
                pageCount={pageCount + 1}
                previousLabel={'<'}
                nextLabel={'>'}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                breakLabel={'...'}
                onPageChange={({ selected }: { selected: number }) =>
                  setPayload((prev) => ({ ...prev, pageNum: selected }))
                }
                forcePage={payload?.pageNum}
              />
            )}
          </>
        )}
      </div>
      {showInviteModal && invitedUser && (
        <ModalWrapper modalName="inviteConfirmModal">
          <InviteConfirmModal>
            <div className="modal-header">
              <Text text="팀원 초대" fontSetting="n26b" />
              <div className="close-btn">
                <Icon iconName="close" func={handleCloseInviteModal} />
              </div>
            </div>
            <div className="modal-content">
              <Text
                text={`[${invitedUser.name}]님을 팀으로 초대하시겠습니까?`}
              />
            </div>
            <div className="modal-footer">
              <Button
                title="취소"
                width="100px"
                func={handleCloseInviteModal}
              />
              <Button title="초대" width="100px" func={handleInvite} />
            </div>
          </InviteConfirmModal>
        </ModalWrapper>
      )}
    </LookupLayout>
  );
}
