import { GetServerSideProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MuiGrid from '@mui/material/Grid2';
import MuiStack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';
import { withGuardPage } from '@/core/auth/guards/withGuardPage';
import { useTranslation } from '@/core/i18n/context';
import { withLayout } from '@/core/components/hoc/layout';
import AuditsTable from '@/core/monitoring/components/containers/audits-table';

const LinkNoSsr = dynamic(() => import('@/core/components/presentational/link'), { ssr: false });

const AuditsPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <MuiGrid
      container
      sx={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        placeContent: 'start',
        p: 4,
      }}
    >
      <MuiStack sx={{ width: '100%' }} direction="column" spacing={1}>
        <MuiBreadcrumbs aria-label="breadcrumb">
          <LinkNoSsr underline="hover" color="inherit" href="/">
            {t('main.navigation.home')}
          </LinkNoSsr>
          <MuiTypography color="text.primary">{t('main.navigation.audits')}</MuiTypography>
        </MuiBreadcrumbs>
        <AuditsTable />
      </MuiStack>
    </MuiGrid>
  );
};

export const getServerSideProps: GetServerSideProps = withGuardPage(async () => {
  return {
    props: {},
  };
});

export default withLayout(AuditsPage, {
  title: 'main.navigation.audits',
  description: 'main.meta.description',
  navigation: true,
});
