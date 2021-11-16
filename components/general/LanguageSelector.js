import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Globe2 } from 'react-bootstrap-icons';
import styled from 'styled-components';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const CurrentLanguage = styled.span`
  display: inline-block;
  width: 1.5rem;
  margin: 0 .5rem;
  text-transform: uppercase;
  color: white;
`;

const languageNames = {
  fi: 'Suomi',
  en: 'English',
};

const LanguageSelector = (props) => {
  const router = useRouter();

  const { locales, pathname, asPath, query } = router
  if (locales?.length < 2) return (null);

  const handleNewLocale = (nextLocale) => router.push({ pathname, query }, asPath, { locale: nextLocale });

  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav>
        <Globe2 color="white" />
        <CurrentLanguage>{ router.locale }</CurrentLanguage>
      </DropdownToggle>
      <DropdownMenu right>
        { locales.map((locale) => (
          <DropdownItem key={locale} onClick={() => handleNewLocale(locale)}>
                {languageNames[locale]}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default LanguageSelector;
