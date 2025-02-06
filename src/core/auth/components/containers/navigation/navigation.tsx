import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/core/components/presentational/navigation';
import Spinner from '@/core/components/presentational/spinner';
import LanguageToggleButton from '@/core/i18n/components/presentational/language-toggle-button';
import { useTranslation } from '@/core/i18n/context';
import { getInitialLetters } from '@/utilities/string.utility';
import { useMutationSignOut } from '../../../hooks';
import { useSession } from '../../../context/session';

const NavigationContainer = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useSession();
  const signOut = useMutationSignOut();

  const memorizedLinks = useMemo(() => {
    const links = [
      { label: t('main.navigation.audits'), onClick: () => router.push('/audits') },
      { label: t('main.navigation.logs'), onClick: () => router.push('/logs') },
    ];

    return links;
  }, [router, t]);

  const memorizedSettings = useMemo(() => {
     const settings = [
      { label: t('main.navigation.sign-out'), onClick: () => signOut.mutate() },
    ];

    return settings;
  }, [signOut, t]);

  const avatarLabel = useMemo(() => {
    if (session.status === 'success') {
      return getInitialLetters(session?.data?.profile?.name, session?.data?.profile?.lastName);
    }
    return '';
  }, [session?.data?.profile?.lastName, session?.data?.profile?.name, session.status]);

  useEffect(() => {
    if (signOut.status === 'success') {
      signOut.reset();
      router.push('/login');
    }
  }, [router, signOut]);

  return (
    <>
      <Spinner loading={signOut.status === 'pending'} label={t('main.navigation.signing-out')} />
      <Navigation
        logo={t('main.navigation.home')}
        avatar={{
          text: avatarLabel,
        }}
        widget={<LanguageToggleButton />}
        links={memorizedLinks}
        settings={memorizedSettings}
      />
    </>
  );
};

export default NavigationContainer;
