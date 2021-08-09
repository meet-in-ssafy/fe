package com.teamgu.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import com.teamgu.api.dto.req.ChatReqDto;
import com.teamgu.api.dto.req.UserRoomCheckDto;
import com.teamgu.api.dto.req.UserRoomInviteReqDto;
import com.teamgu.api.dto.res.ChatMessageResDto;
import com.teamgu.api.dto.res.ChatRoomResDto;
import com.teamgu.api.dto.res.CommonResponse;
import com.teamgu.api.service.ChatServiceImpl;
import com.teamgu.api.service.UserServiceImpl;
import com.teamgu.api.vo.MessageTemplate;
import com.teamgu.database.entity.Chat;
import com.teamgu.database.entity.User;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Controller
@Log4j2
@CrossOrigin("*")
public class StompChatController {
	@Autowired
	ChatServiceImpl chatService;
	
	@Autowired
	UserServiceImpl userService;
	
	@Autowired
	MessageTemplate simpMessagingTemplate;
	
	@MessageMapping(value="/chat/enter")//참여
	public void enter(ChatReqDto message) {
		message.setMessage(message.getSender_id()+"님이 채팅방에 참여하셨습니다.");
		simpMessagingTemplate.getTemplate().convertAndSend("/receive/chat/room/"+message.getRoom_id(),message);
	}
	
	/**
	 * 소켓을 통해 메세지 전송을 하면 message 메서드로 들어온다
	 * 즉, 여기서 DB에 대한 저장과 메세지 전송을 담당한다
	 * @param message
	 */
	@MessageMapping(value="/chat/message")
	public void message(@RequestBody ChatReqDto message) {
		log.info("in message...");
		Chat chatres = chatService.saveChat(message);
		log.info("chatRES test");
		log.info(message.getSender_id());
		User sender = userService.getUserById(message.getSender_id()).get();		
		log.info(sender.getName()); // 사용자의 이름을 가져옴
		log.info(chatres.getMessage());
		log.info(chatres.getSendDateTime());
		if (chatres!=null) {
			ChatMessageResDto chatMessageResDto = ChatMessageResDto.builder()
																	.chat_id(chatres.getId())
																	.sender_id(message.getSender_id())
																	.sender_name(sender.getName())
																	.type(chatres.getType())
																	.message(chatres.getMessage())
																	.create_date_time(chatres.getSendDateTime())
																	.unread_user_count(0)
																	.build();simpMessagingTemplate.getTemplate().convertAndSend("/receive/chat/room/"+message.getRoom_id(),chatMessageResDto);			
			log.info("message db saved done");
		}
		else
			log.error("message db save failed");
	}
	
	/**
	 * 메세지를 동일하게 전송하지만 RTC 전용 메세지 처리부다
	 * @param message
	 */
	@MessageMapping(value="/chat/messageRTC")
	public void messageRTC(@RequestBody UserRoomInviteReqDto userReqDto) {
		log.info("in user-invite...");
		log.info(userReqDto.getUser_id()+"가 "+userReqDto.getRoom_id()+" 방에 메세지를 보냅ㄴ디ㅏ");
		long roomid = userReqDto.getRoom_id();
		String name = userService.getUserById(userReqDto.getUser_id()).get().getName();
		//1. 초대 메세지 보내기 전에 저장
		log.info("saving RTC invite message");
		ChatReqDto chatReqDto = ChatReqDto.builder()
											.room_id(roomid)
											.sender_id(userReqDto.getUser_id())
											.message("화상회의실이 개설되었습니다")
											.type("RTC_INVITE")
											.build();
		Chat chatres = chatService.saveChat(chatReqDto);
		log.info("broadcasting RTC invite message");
		//2. 메세지 구독룸으로 브로드캐스팅
		ChatMessageResDto chatMessageResDto = ChatMessageResDto.builder()
												.create_date_time(chatres.getSendDateTime())
												.message(chatres.getMessage())
												.sender_id(userReqDto.getUser_id())
												.sender_name(name)
												.type(chatres.getType())
												.unread_user_count(0)
												.build();												
		log.info("브로드캐스팅 방 번호 : "+roomid);
		simpMessagingTemplate.getTemplate().convertAndSend("/receive/chat/room/"+roomid,chatMessageResDto);
		log.info("bradcasting done");	
	}
}
