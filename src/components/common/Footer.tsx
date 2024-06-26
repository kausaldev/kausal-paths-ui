import { useTranslation } from 'common/i18n';
import { Link } from 'common/links';
import { useSite } from 'context/site';
import { transparentize } from 'polished';
import SVG from 'react-inlinesvg';
import { Container } from 'reactstrap';
import styled, { useTheme } from 'styled-components';

import { getThemeStaticURL } from '@/common/theme';
import Icon from './icon';

const StyledFooter = styled.footer`
  position: relative;
  min-height: 10em;
  clear: both;
  background-color: ${(props) => props.theme.footerBackgroundColor};
  color: ${(props) => transparentize(0.2, props.theme.footerColor)};
  padding: ${(props) => props.theme.spaces.s200} 0;

  a {
    color: ${(props) => props.theme.footerColor};

    &:hover {
      color: ${(props) => props.theme.footerColor};
      text-decoration: underline;
    }
  }

  .footer-column {
    @media (max-width: ${(props) => props.theme.breakpointMd}) {
      margin-bottom: ${(props) => props.theme.spaces.s300};
      text-align: center;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    text-align: center;
  }

  @media print {
    display: none;
  }
`;

const Branding = styled.div`
  display: flex;
  flex-direction: ${(props) => {
    let direction;
    switch (props.theme.footerLogoPlacement) {
      case 'left':
        direction = 'row';
        break;
      case 'top':
        direction = 'column';
        break;
      default:
        direction = 'row';
    }
    return direction;
  }};
  margin-bottom: ${(props) => props.theme.spaces.s300};

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    flex-direction: column;
    width: 100%;
  }
`;

const Logo = styled.div`
  height: calc(${(props) => props.theme.footerLogoSize} * ${(props) => props.theme.spaces.s400});
  max-width: calc(
    ${(props) => props.theme.footerLogoSize} * 4 * ${(props) => props.theme.spaces.s300}
  );
  margin-right: ${(props) => props.theme.spaces.s200};
  margin: ${(props) => props.theme.spaces.s150} ${(props) => props.theme.spaces.s200}
    ${(props) => props.theme.spaces.s150} 0;

  svg {
    height: 100%;
    max-width: 100%;
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    margin: 0 auto ${(props) => props.theme.spaces.s200};
  }
`;

const ServiceTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  font-size: ${(props) => props.theme.fontSizeMd};
  font-weight: ${(props) => props.theme.fontWeightBold};

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    flex-direction: column;
  }
`;

const OrgTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeBase};
  font-weight: ${(props) => props.theme.fontWeightBold};
`;

const FooterNav = styled.nav`
  line-height: ${(props) => props.theme.lineHeightSm};
`;

const UtilitySection = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: ${(props) => props.theme.spaces.s200} 0 0;
  border-top: 1px solid ${(props) => transparentize(0.8, props.theme.footerColor)};
  line-height: ${(props) => props.theme.lineHeightSm};

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

const UtilityColumn = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    flex-direction: column;
    align-items: center;
    width: 100%;

    &:first-child {
      margin-bottom: ${(props) => props.theme.spaces.s150};
    }
  }
`;

const UtilityItem = styled.li`
  margin-left: ${(props) => props.theme.spaces.s150};
  margin-bottom: ${(props) => props.theme.spaces.s200};
  font-weight: ${(props) => props.theme.fontWeightBold};

  &:first-child {
    margin-left: 0;
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    margin-left: 0;

    &:before {
      content: '';
      margin-left: 0;
    }
  }
`;

const TopButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: ${(props) => props.theme.fontWeightBold};
  cursor: pointer;
  color: ${(props) => props.theme.footerColor};

  .icon {
    margin-top: -0.25em;
  }

  &:hover {
    color: ${(props) => props.theme.footerColor};
    text-decoration: underline;
  }
`;

const BaseSection = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${(props) => props.theme.spaces.s200} 0;
  border-top: 1px solid ${(props) => transparentize(0.8, props.theme.footerColor)};
  line-height: ${(props) => props.theme.lineHeightSm};

  @media (max-width: ${(props) => props.theme.breakpointLg}) {
    flex-direction: column;
    align-items: left;
  }
`;

const BaseColumn = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;

  @media (max-width: ${(props) => props.theme.breakpointLg}) {
    justify-content: left;
    flex-basis: 100%;
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    justify-content: center;
  }
`;

const BaseLink = styled.li`
  margin-left: ${(props) => props.theme.spaces.s200};

  a {
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpointLg}) {
    &:first-child {
      margin-left: 0;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    margin: 0 0 ${(props) => props.theme.spaces.s200};
    max-width: 100%;
    width: 50%;
    padding: 0 ${(props) => props.theme.spaces.s100};
  }
`;

const SecondFooter = styled.div`
  background-color: ${(props) => props.theme.secondFooterBackgroundColor};
  color: ${(props) => props.theme.secondFooterColor};
`;

const FooterExtras = styled.div`
  padding: ${(props) => props.theme.spaces.s100} 0;
`;

const FooterStatement = styled.div`
  max-width: 800px;
  margin-bottom: ${(props) => props.theme.spaces.s100};

  h1,
  h2,
  h3 {
    font-size: ${(props) => props.theme.fontSizeBase};
    color: ${(props) => props.theme.footerColor};
  }

  @media (min-width: ${(props) => props.theme.breakpointMd}) {
    margin-right: ${(props) => props.theme.spaces.s200};
  }
`;

const FundingInstruments = styled.div<{ $wrap?: boolean }>`
  width: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: ${(props) => (props.$wrap ? 'center' : 'flex-end')};
  padding: 0;
  margin-bottom: ${(props) => props.theme.spaces.s200};
`;

const FundingHeader = styled.div`
  flex-basis: 100%;
  text-align: right;
  margin-bottom: ${(props) => props.theme.spaces.s100};
  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    text-align: center;
  }
`;

const FundingInstrumentContainer = styled.div<{ $small?: boolean }>`
  height: ${(props) => (props.$small ? '10rem' : '12rem')};
  width: ${(props) => (props.$small ? '10rem' : '12rem')};
  margin-left: ${(props) => props.theme.spaces.s300};
  text-align: right;

  svg {
    height: 100%;
    max-width: 100%;
  }

  @media (max-width: ${(props) => props.theme.breakpointMd}) {
    margin: ${(props) => props.theme.spaces.s200};
    text-align: center;
  }
`;

function SiteFooter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const site = useSite();

  const utilityLinks = [];
  const additionalLinks = [];
  const ownerName = site.owner;
  const siteTitle = site.title;
  const ownerUrl = undefined;
  const ownerLinks = theme.settings?.footerOwnerLinks;
  const { fundingInstruments, otherLogos, footerStatement } = theme.settings;

  const OrgLogo = () => {
    return (
      <SVG
        src={getThemeStaticURL(theme.themeLogoWhiteUrl)}
        preserveAspectRatio="xMinYMid meet"
        title={`${ownerName}, ${siteTitle} ${t('front-page')}`}
        style={{ display: 'block' }}
      />
    );
  };

  function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }

  return (
    <StyledFooter className="site-footer">
      <Container>
        <FooterNav aria-label={t('nav-footer')}>
          <Branding>
            {theme.themeLogoWhiteUrl ? (
              <Logo>
                {theme?.footerLogoLink ? (
                  <a href={theme.footerLogoLink} target="_blank" rel="noreferrer">
                    <OrgLogo aria-hidden="true" className="footer-org-logo" />
                  </a>
                ) : (
                  <OrgLogo aria-hidden="true" className="footer-org-logo" />
                )}
              </Logo>
            ) : null}
            {!theme.settings.footerLogoOnly && (
              <ServiceTitle>
                <Link href="/">{siteTitle}</Link>
              </ServiceTitle>
            )}
          </Branding>
        </FooterNav>
        <UtilitySection>
          <UtilityColumn>
            <UtilityItem>
              <OrgTitle>
                {ownerUrl ? (
                  <Link href={ownerUrl} target="_blank" rel="noreferrer">
                    {theme?.navLinkIcons && (
                      <Icon
                        name="angleRight"
                        color={theme.footerColor}
                        aria-hidden="true"
                        className="me-1"
                      />
                    )}
                    {ownerName}
                  </Link>
                ) : (
                  ownerName
                )}
              </OrgTitle>
            </UtilityItem>
            {ownerLinks &&
              ownerLinks.map((page) => (
                <UtilityItem key={page.id}>
                  <Link href={page.url}>
                    {theme?.navLinkIcons && (
                      <Icon
                        name="angleRight"
                        color={theme.footerColor}
                        aria-hidden="true"
                        className="me-1"
                      />
                    )}
                    {page.title}
                  </Link>
                </UtilityItem>
              ))}
          </UtilityColumn>
          <UtilityColumn>
            {utilityLinks &&
              utilityLinks.map((page) => (
                <UtilityItem key={page.id}>
                  <a href={page.slug}>
                    {page.icon && (
                      <Icon
                        name={page.icon}
                        color={theme.footerColor}
                        aria-hidden="true"
                        className="me-1"
                      />
                    )}
                    {page.name}
                  </a>
                </UtilityItem>
              ))}
            <UtilityItem>
              <TopButton type="button" onClick={scrollToTop}>
                {t('back-to-top')}{' '}
                <Icon
                  name="arrowUp"
                  color={theme.footerColor}
                  aria-hidden="true"
                  width="1.25em"
                  height="1.25em"
                />
              </TopButton>
            </UtilityItem>
          </UtilityColumn>
        </UtilitySection>
        <BaseSection>
          <BaseColumn></BaseColumn>
          <BaseColumn>
            {additionalLinks &&
              additionalLinks.map((page) => (
                <BaseLink key={page.slug}>
                  <Link href={page.slug}>{page.name}</Link>
                </BaseLink>
              ))}
            <BaseLink>
              {t('published-on')}{' '}
              <a href="https://kausal.tech" target="_blank" rel="noreferrer">
                Kausal Paths
              </a>
            </BaseLink>
          </BaseColumn>
        </BaseSection>
      </Container>
      <SecondFooter>
        <Container>
          <FooterExtras>
            {fundingInstruments?.length > 0 && (
              <FundingInstruments>
                <FundingHeader>{t('supported-by')}</FundingHeader>
                {fundingInstruments.map((funder) => (
                  <FundingInstrumentContainer key={funder.id}>
                    <a href={funder.link} target="_blank" rel="noreferrer">
                      <SVG
                        src={funder.logo}
                        preserveAspectRatio="xMidYMid meet"
                        title={funder.name}
                      />
                    </a>
                  </FundingInstrumentContainer>
                ))}
              </FundingInstruments>
            )}
            {/* If we have more than 4 otherLogos render them smaller  */}
            {otherLogos?.length > 0 && (
              <FundingInstruments $wrap={otherLogos.length > 4}>
                {otherLogos.map((logo) => (
                  <FundingInstrumentContainer key={logo.id} $small={otherLogos.length > 4}>
                    <a
                      href={logo.link ? logo.link : '#'}
                      target={logo.link ? '_blank' : '_self'}
                      rel={logo.link ? 'noreferrer' : ''}
                    >
                      <SVG
                        src={logo.logo}
                        preserveAspectRatio="xMidYMid meet"
                        title={logo.name}
                        style={{ display: 'block' }}
                      />
                    </a>
                  </FundingInstrumentContainer>
                ))}
              </FundingInstruments>
            )}
            {footerStatement && (
              <FooterStatement dangerouslySetInnerHTML={{ __html: footerStatement }} />
            )}
          </FooterExtras>
        </Container>
      </SecondFooter>
    </StyledFooter>
  );
}

export default SiteFooter;
