import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import * as eventTracking from '../../../infrastructure/event-tracking'
import { useProjectContext } from '../../../shared/context/project-context'
import HotkeysModal from '../../hotkeys-modal/components/hotkeys-modal'
import LeftMenuButton from './left-menu-button'
import { bsVersionIcon } from '@/features/utils/bootstrap-5'
import GitSyncModal from '@/features/gitsync-modal/components/gitsync-modal'

export default function HelpShowHotkeys() {
  const [showModal, setShowModal] = useState(false)
  const [showModalGit, setShowModalGit] = useState(false)
  const { t } = useTranslation()
  const { features } = useProjectContext()
  const isMac = /Mac/.test(window.navigator?.platform)

  const showModalWithAnalytics = useCallback(() => {
    eventTracking.sendMB('left-menu-hotkeys')
    setShowModal(true)
  }, [])

  return (
    <>

      <LeftMenuButton
        onClick={() => setShowModalGit(true)}
        icon={bsVersionIcon({
          bs5: { type: 'git' },
          bs3: { type: 'git', fw: true },
        })}
      >
        {t('gitsync-title')}
      </LeftMenuButton>
      <GitSyncModal show={showModalGit} handleHide={() => setShowModalGit(false)} />
      <LeftMenuButton
        onClick={showModalWithAnalytics}
        icon={bsVersionIcon({
          bs5: { type: 'keyboard' },
          bs3: { type: 'keyboard-o', fw: true },
        })}
      >
        {t('show_hotkeys')}
      </LeftMenuButton>
      <HotkeysModal
        show={showModal}
        handleHide={() => setShowModal(false)}
        isMac={isMac}
        trackChangesVisible={features?.trackChangesVisible}
      />
    </>
  )
}
