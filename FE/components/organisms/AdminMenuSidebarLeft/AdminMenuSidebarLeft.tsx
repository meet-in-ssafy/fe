import { ReactElement, useState } from 'react';
import styled from 'styled-components';

import { Text } from '@atoms';
import { SimpleSelect } from '@molecules';
import { Project } from '@utils/type';
import { ADMIN_MENU_CONTENT } from '@utils/constants';

const Wrapper = styled.div`
  .sidebar {
    position: relative;

    display: flex;
    flex-direction: column;
    box-shadow: 3px 0px 5px rgba(55, 53, 47, 0.4);

    .sidebar-header {
      flex: 0 0 100px;

      display: flex;
      align-items: center;

      border: solid 2px #3848a0;
      background-color: #e8eaf6;

      .selected-project-info {
        flex: 1;
        text-align: center;

        .current-project-text {
          cursor: pointer;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
      }
    }

    .sidebar-content {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      gap: 40px;

      background-color: #3848a0;
      color: white;
      padding: 60px 0;

      > div {
        margin-left: 20px;
        cursor: pointer;
      }
    }
  }
`;



interface AdminMenuSidebarLeftProps {
  onChangeMenu: (selectedMenu: number) => void;
  onChangeProject: (selectedProjectId: number) => void;
  projects: Project[];
}

export default function AdminMenuSidebarLeft({
  onChangeMenu,
  onChangeProject,
  projects,
}: AdminMenuSidebarLeftProps): ReactElement {
  const menuOptions = ADMIN_MENU_CONTENT.map((v, i) => {
    return { id: i, title: v, label: v, value: i };
  });

  const projectOptions = projects.map(({ id, name }) => {
    return { id, name, value: id, label: name };
  });

  const [selectedMenu, setSelectedMenu] = useState(0);
  const [selectedProject, setSelectedProject] = useState({
    ...projects[0],
    label: projects[0].name,
    value: projects[0].id,
  });
  const [clickSelectProject, setClickSelectProject] = useState(false);

  const handleChangeMenu = (index: number) => {
    setSelectedMenu(index);
    onChangeMenu(index);
  };

  const handleChangeSelectProject = () => {
    setClickSelectProject(!clickSelectProject);
  };

  const handleChangeProject = (project: Project) => {
    setSelectedProject({ ...project, label: project.name, value: project.id });
    onChangeProject(project.id);
  };

  const customStyles = {
    container: (base: any) => ({
      ...base,
      display: 'inline-block',
      width: '80%',
    }),
    valueContainer: (base: any) => ({
      ...base,
      minHeight: '10px',
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: '14px',
    }),
    option: (base: any) => ({
      ...base,
      fontSize: '14px',
    }),
    menuList: (base: any) => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    menu: (base: any) => ({
      ...base,
      marginTop: 0,
    }),
  };

  return (
    <Wrapper>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="selected-project-info">
            <Text text="현재 선택된 프로젝트" color="gray" fontSetting="n16m" />
            {clickSelectProject ? (
              <SimpleSelect
                options={projectOptions}
                onChange={handleChangeProject}
                onBlur={handleChangeSelectProject}
                customStyles={customStyles}
                value={selectedProject}
                autofocus={true}
              />
            ) : (
              <div onClick={handleChangeSelectProject} className="current-project-text">
                <Text text={selectedProject.name} fontSetting="n20m" />
              </div>
            )}
          </div>
        </div>
        <div className="sidebar-content">
          {menuOptions.map(({ id, title }) => (
            <div key={id} onClick={() => handleChangeMenu(id)}>
              <Text
                text={title}
                fontSetting={id === selectedMenu ? 'n26b' : 'n16m'}
                color={id === selectedMenu ? 'white' : '#eeeeee'}
                isLineBreak
              />
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
