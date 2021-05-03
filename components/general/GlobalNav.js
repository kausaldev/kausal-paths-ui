import React, { useState, useContext } from 'react';
import Link from 'next/link'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';

const GlobalNav = (props) => {

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="light" light expand="md">
      <Link href="/" passHref>
        <NavbarBrand href="/">
          Tampereen päästöskenaariot
        </NavbarBrand>
      </Link>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <Link href="/" passHref>
              <NavLink>
                Päästöt
              </NavLink>
            </Link>
          </NavItem>
          <NavItem>
            <Link href="/actions" passHref>
              <NavLink>
                Toimet
              </NavLink>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  )
}

export default GlobalNav;
