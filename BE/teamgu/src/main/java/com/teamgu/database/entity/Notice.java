package com.teamgu.database.entity;

import java.util.Date;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Notice extends BaseEntity{
    Date createDate;
    Date modifyDate;
    @Column(length = 80)
    String title;
    @Column(length = 2000)
    String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id")
    private User user;


    @OneToMany(
            mappedBy = "notice",
            cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE},
            orphanRemoval=true
    )
    private List<NoticeFile> noticeFiles = new ArrayList<>();

    public void addFile(NoticeFile noticeFile) {
        if(this.noticeFiles == null) noticeFiles = new ArrayList<>();

        noticeFiles.add(noticeFile);

        if(noticeFile.getNotice() != this) {
            noticeFile.setNotice(this);
        }
    }
}
