/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Icon, Menu } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';
import { useTheme } from '../../../contexts';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';
import { BoardMembershipRoles, BoardViews, UserRoles } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';
import UserStep from '../../users/UserStep';
import NotificationsStep from '../../notifications/NotificationsStep';

import styles from './Header.module.scss';

const POPUP_PROPS = {
  position: 'bottom right',
};

const Header = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);
  const project = useSelector(selectors.selectCurrentProject);
  const board = useSelector(selectors.selectCurrentBoard);
  const notificationIds = useSelector(selectors.selectNotificationIdsForCurrentUser);
  const isFavoritesEnabled = useSelector(selectors.selectIsFavoritesEnabled);
  const isEditModeEnabled = useSelector(selectors.selectIsEditModeEnabled);

  const withFavoritesToggler = useSelector(
    // TODO: use selector instead?
    (state) => selectors.selectFavoriteProjectIdsForCurrentUser(state).length > 0,
  );

  const { withEditModeToggler, canEditProject } = useSelector((state) => {
    if (!project) {
      return {
        withEditModeToggler: false,
        canEditProject: false,
      };
    }

    const isAdminInSharedProject = user.role === UserRoles.ADMIN && !project.ownerProjectManagerId;
    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

    if (isAdminInSharedProject || isManager) {
      return {
        withEditModeToggler: true,
        canEditProject: isEditModeEnabled,
      };
    }

    if (!board) {
      return {
        withEditModeToggler: false,
        canEditProject: false,
      };
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    return {
      withEditModeToggler: board.view === BoardViews.KANBAN && isEditor,
      canEditProject: false,
    };
  }, shallowEqual);

  const dispatch = useDispatch();

  const handleToggleEditModeClick = useCallback(() => {
    dispatch(entryActions.toggleEditMode(!isEditModeEnabled));
  }, [isEditModeEnabled, dispatch]);

  const handleToggleFavoritesClick = useCallback(() => {
    dispatch(entryActions.toggleFavorites(!isFavoritesEnabled));
  }, [isFavoritesEnabled, dispatch]);

  const handleProjectSettingsClick = useCallback(() => {
    if (!canEditProject) {
      return;
    }

    dispatch(entryActions.openProjectSettingsModal());
  }, [canEditProject, dispatch]);

  const NotificationsPopup = usePopup(NotificationsStep, POPUP_PROPS);
  const UserPopup = usePopup(UserStep, POPUP_PROPS);
  const { theme, toggleTheme } = useTheme();
  const menuItemStyle = { color: theme === 'dark' ? '#fff' : '#22252a' };

  return (
    <div className={styles.wrapper}>
      {!project && (
        <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
          TABLERO TURISMO
        </Link>
      )}
      <Menu inverted size="large" className={styles.menu}>
        {project && (
          <Menu.Menu position="left">
            <Menu.Item
              as={Link}
              to={Paths.ROOT}
              className={classNames(styles.item, styles.itemHoverable)}
              style={menuItemStyle}
            >
              <Icon fitted name="arrow left" />
            </Menu.Item>
            <Menu.Item className={classNames(styles.item, styles.title)} style={menuItemStyle}>
              {project.name}
              {canEditProject && (
                <Button
                  className={styles.editButton}
                  onClick={handleProjectSettingsClick}
                  style={menuItemStyle}
                >
                  <Icon fitted name="pencil" size="small" />
                </Button>
              )}
            </Menu.Item>
          </Menu.Menu>
        )}
        <Menu.Menu position="right">
          {withFavoritesToggler && (
            <Menu.Item
              className={classNames(styles.item, styles.itemHoverable)}
              onClick={handleToggleFavoritesClick}
              style={menuItemStyle}
            >
              <Icon
                fitted
                name={isFavoritesEnabled ? 'star' : 'star outline'}
                className={classNames(isFavoritesEnabled && styles.itemIconEnabled)}
                style={menuItemStyle}
              />
            </Menu.Item>
          )}
          {withEditModeToggler && (
            <Menu.Item
              className={classNames(styles.item, styles.itemHoverable)}
              onClick={handleToggleEditModeClick}
              style={menuItemStyle}
            >
              <Icon
                fitted
                name={isEditModeEnabled ? 'unlock' : 'lock'}
                className={classNames(isEditModeEnabled && styles.itemIconEnabled)}
                style={menuItemStyle}
              />
            </Menu.Item>
          )}
          <NotificationsPopup>
            <Menu.Item
              className={classNames(styles.item, styles.itemHoverable)}
              style={menuItemStyle}
            >
              <Icon fitted name="bell" style={menuItemStyle} />
              {notificationIds.length > 0 && (
                <span className={styles.notification}>{notificationIds.length}</span>
              )}
            </Menu.Item>
          </NotificationsPopup>
          <Menu.Item
            className={classNames(styles.item, styles.itemHoverable)}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Tema oscuro' : 'Tema claro'}
            style={menuItemStyle}
          >
            {theme === 'dark' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: menuItemStyle.color }}
              >
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: menuItemStyle.color }}
              >
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            )}
          </Menu.Item>
          <UserPopup>
            <Menu.Item
              className={classNames(styles.item, styles.itemHoverable)}
              style={menuItemStyle}
            >
              <span className={styles.userName}>{user.name}</span>
              <UserAvatar id={user.id} size="small" />
            </Menu.Item>
          </UserPopup>
        </Menu.Menu>
      </Menu>
    </div>
  );
});

export default Header;
