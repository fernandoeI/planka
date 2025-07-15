/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Form, Grid, Header, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { isUsername } from '../../../utils/validator';

import styles from './Content.module.scss';
import TrelloIzquierda from '../../../assets/images/trello izquierda.svg';
import TrelloDerecha from '../../../assets/images/trello derecha.svg';
import LOGOBLANCO from '../../../assets/images/logo-blanco.png'
import LOGOCOLOR from '../../../assets/images/logo.png'
import { useTheme } from '../../../contexts';


const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid credentials':
      return {
        type: 'error',
        content: 'common.invalidCredentials',
      };
    case 'Invalid email or username':
      return {
        type: 'error',
        content: 'common.invalidEmailOrUsername',
      };
    case 'Invalid password':
      return {
        type: 'error',
        content: 'common.invalidPassword',
      };
    case 'Use single sign-on':
      return {
        type: 'error',
        content: 'common.useSingleSignOn',
      };
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    case 'Active users limit reached':
      return {
        type: 'error',
        content: 'common.activeUsersLimitReached',
      };
    case 'Failed to fetch':
      return {
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const Content = React.memo(() => {
  const config = useSelector(selectors.selectConfig);

  const { data: defaultData, isSubmitting, error } = useSelector(selectors.selectAuthenticateForm);


  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm(() => ({
    emailOrUsername: '',
    password: '',
    ...defaultData,
  }));

  const message = useMemo(() => createMessage(error), [error]);
  const [focusPasswordFieldState, focusPasswordField] = useToggle();

  const [emailOrUsernameFieldRef, handleEmailOrUsernameFieldRef] = useNestedRef('inputRef');
  const [passwordFieldRef, handlePasswordFieldRef] = useNestedRef('inputRef');

  const { theme, toggleTheme } = useTheme();
  const menuItemStyle = { color: theme === 'dark' ? '#fff' : '#22252a', cursor: 'pointer' };
  const LOGO =  theme === 'dark' ? LOGOBLANCO : LOGOCOLOR ;

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      emailOrUsername: data.emailOrUsername.trim(),
    };

    if (!isEmail(cleanData.emailOrUsername) && !isUsername(cleanData.emailOrUsername)) {
      emailOrUsernameFieldRef.current.select();
      return;
    }

    if (!cleanData.password) {
      passwordFieldRef.current.focus();
      return;
    }

    dispatch(entryActions.authenticate(cleanData));
  }, [dispatch, data, emailOrUsernameFieldRef, passwordFieldRef]);

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearAuthenticateError());
  }, [dispatch]);

  const withOidc = !!config.oidc;
  const isOidcEnforced = withOidc && config.oidc.isEnforced;

  useEffect(() => {
    if (!isOidcEnforced) {
      emailOrUsernameFieldRef.current.focus();
    }
  }, [emailOrUsernameFieldRef, isOidcEnforced]);

  useDidUpdate(() => {
    if (wasSubmitting && !isSubmitting && error) {
      switch (error.message) {
        case 'Invalid credentials':
        case 'Invalid email or username':
          emailOrUsernameFieldRef.current.select();

          break;
        case 'Invalid password':
          setData((prevData) => ({
            ...prevData,
            password: '',
          }));
          focusPasswordField();

          break;
        default:
      }
    }
  }, [isSubmitting, wasSubmitting, error]);

  useDidUpdate(() => {
    passwordFieldRef.current.focus();
  }, [focusPasswordFieldState]);

  return (
    <div
      className={classNames(styles.wrapper, styles.fullHeight)}
      style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg)' }}
    >
      {/* Switch de tema en la parte superior derecha */}
      <div
        role="button"
        tabIndex={0}
        aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        style={{ position: 'absolute', top: 24, right: 32, zIndex: 2, outline: 'none' }}
        onClick={toggleTheme}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleTheme();
          }
        }}
        title={theme === 'dark' ? 'Tema oscuro' : 'Tema claro'}
      >
        {theme === 'dark' ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={menuItemStyle}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={menuItemStyle}
            xmlns="http://www.w3.org/2000/svg"
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
      </div>
      <Grid
        verticalAlign="middle"
        className={classNames(styles.grid, styles.fullHeight)}
        style={{ minHeight: '100vh' }}
      >
        <Grid.Column computer={6} tablet={16} mobile={16} style={{ margin: '0 auto' }}>
          <div
            className={styles.loginWrapper}
            style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              padding: 32,
            }}
          >

             <img src={LOGO} alt="Logo" style={{display: 'flex', maxWidth:200, justifySelf:'center'}}  />

            <Header
              as="h2"
              textAlign="center"
              content={t('common.logIn', { context: 'title' })}
              className={styles.formSubtitle}
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <div className={styles.formWrapper}>
              {message && (
                <Message
                  {...{ [message.type]: true }}
                  visible
                  content={t(message.content)}
                  onDismiss={handleMessageDismiss}
                />
              )}
              <Form size="large" onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
                  <Input
                    fluid
                    ref={handleEmailOrUsernameFieldRef}
                    name="emailOrUsername"
                    value={data.emailOrUsername}
                    maxLength={256}
                    readOnly={isSubmitting}
                    className={styles.input}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputLabel}>{t('common.password')}</div>
                  <Input.Password
                    fluid
                    ref={handlePasswordFieldRef}
                    name="password"
                    value={data.password}
                    maxLength={256}
                    readOnly={isSubmitting}
                    className={styles.input}
                    onChange={handleFieldChange}
                  />
                </div>
                <Form.Button
                  fluid
                  icon="right arrow"
                  labelPosition="right"
                  content={t('action.logIn')}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{
                    marginTop: 16,
                    borderRadius: 8,
                    background: '#9A1445',
                    color: '#fff',
                    border: 'none',
                  }}
                />
              </Form>
            </div>
          </div>
        </Grid.Column>
      </Grid>
      {/* Imágenes decorativas en la parte inferior */}
      <img
        src={TrelloIzquierda}
        alt="Decoración izquierda"
        className="login-trello-img login-trello-img-left"
      />
      <img
        src={TrelloDerecha}
        alt="Decoración derecha"
        className="login-trello-img login-trello-img-right"
      />
      <style>{`
        .login-trello-img {
          position: fixed;
          bottom: 0;
          z-index: 0;
          width: 340px;
          max-width: 30vw;
          min-width: 120px;
          display: block;
          pointer-events: none;
          transition: width 0.2s;
        }
        .login-trello-img-left { left: 0; }
        .login-trello-img-right { right: 0; }
        @media (max-width: 1200px) {
          .login-trello-img { width: 220px; max-width: 35vw; }
        }
        @media (max-width: 900px) {
          .login-trello-img { width: 140px; max-width: 40vw; }
        }
        @media (max-width: 768px) {
          .login-trello-img { display: none !important; }
        }
      `}</style>
    </div>
  );
});

export default Content;
