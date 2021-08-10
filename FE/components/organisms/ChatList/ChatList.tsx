import { ReactElement, useState, useEffect } from 'react';
import styled from 'styled-components';

import { getChatLists, postCreateRoom } from '@repository/chatRepository';
import { ProfileContainer, UserSelectChatAutoComplete } from '@molecules';
import { Button } from '@molecules';
import { useAuthState, useAppDispatch, displayModal } from '@store';
import { MemberOption } from '@utils/type';
import { MODALS } from '@utils/constants';

interface ChatListProps {
  handleToChatRoom: (id: number, room_name: string) => Promise<void>;
  handleSendRtcLink: (user_id1: number, user_id2: number) => void;
}

interface UserList {
  chat_room_id: number;
  room_name: string;
  last_chat_message: string;
  send_date_time: string;
  unread_message_count: number | string;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  .upper {
    display: grid;
    grid-template-columns: 1.5fr 0.25fr 0.25fr;
    > button {
      box-shadow: none;
      background-color: white;
      height: 100%;
      > div {
        color: black;
      }
      border: 1px solid lightgray;
    }
  }

  .user-list {
    overflow-y: auto;
    height: calc(100% - 100px);
  }
`;

export default function ChatList({
  handleToChatRoom,
  handleSendRtcLink,
}: ChatListProps): ReactElement {
  const dispatch = useAppDispatch();
  const {
    user: { id },
  } = useAuthState();

  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState();

  const handleGetChatLists = async () => {
    try {
      const {
        data: { data },
      } = await getChatLists(id);

      setUserList(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetChatLists();
    const interval = setInterval(() => {
      handleGetChatLists();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleChangeUserSelect = async (selected: MemberOption | null) => {
    if (selected) {
      setSelectedUser(selected);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedUser) {
      try {
        const {
          data: {
            data: { chat_room_id, room_name },
          },
        } = await postCreateRoom({
          user_id1: id,
          user_id2: selectedUser?.user_id,
        });

        handleToChatRoom(chat_room_id, room_name);
        return handleGetChatLists();
      } catch (error) {
        return console.error(error);
      }
    }
    dispatch(
      displayModal({
        modalName: MODALS.ALERT_MODAL,
        content: '유저를 선택해주세요!.',
      }),
    );
  };

  return (
    <Wrapper>
      <div className="upper">
        <UserSelectChatAutoComplete
          handleChangeUserSelect={handleChangeUserSelect}
        />
        <Button title="생성" width="100%" func={() => handleCreateRoom()} />
        <Button
          title="통화"
          width="100%"
          func={() => handleSendRtcLink(id, selectedUser?.user_id)}
        />
      </div>
      <div className="user-list">
        {userList?.map(
          ({
            chat_room_id,
            room_name,
            last_chat_message,
            send_date_time,
            unread_message_count,
          }: UserList) => (
            <ProfileContainer
              name={room_name}
              content={last_chat_message}
              isActive={false}
              time={send_date_time}
              alertNumber={unread_message_count}
              func={() => handleToChatRoom(chat_room_id, room_name)}
            />
          ),
        )}
      </div>
    </Wrapper>
  );
}
