import { Button } from 'react-bootstrap'
import OLTooltip from '@/features/ui/components/ol/ol-tooltip'
import React, { useCallback } from 'react'
import OLButton from '@/features/ui/components/ol/ol-button'

import Icon from '../../../shared/components/icon'
import { useDetachCompileContext as useCompileContext } from '../../../shared/context/detach-compile-context'
import { useProjectContext } from '../../../shared/context/project-context'
import * as eventTracking from '../../../infrastructure/event-tracking'
import { postJSON } from '../../../infrastructure/fetch-json'
import GitSyncModal from '@/features/gitsync-modal/components/gitsync-modal'


async function makeSyncHappen(project_id) {
  try {
    const resp = await postJSON(`/project/${project_id}/gitsync`, {})
    return resp?.success ?? false
  } catch (e) {
    return false
  }

}
function PdfGitButton() {
  //@ts-ignore
  let has_config = window.overleaf.unstable.store?.items?.get("project")?.value?.rootFolder[0]?.fileRefs?.some(o => o?.name ==="git.config")
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isDone, setIsDone] = React.useState(false)
  const { _id: projectId } = useProjectContext()
  const [showModalGit, setShowModalGit] = React.useState(false)

  const description = "Git Sync"

  async function handleClick() {
    //@ts-ignore
    has_config =  window.overleaf.unstable.store?.items?.get("project")?.value?.rootFolder[0]?.fileRefs?.some(o => o?.name ==="git.config")
    if (has_config) {
      setIsSyncing(true)
      const success = await makeSyncHappen(projectId)
      setIsSyncing(false)
      if(success) {
        setIsDone(true)
        setTimeout(() => {
          setIsDone(false)
        }, 15_000)
      } else {
        alert("Failed to sync to Git. Dit you set up Git Sync in the project correctly? Is the git repository writable by the deploy key? Are you ratelimited?")
      }
    } else {
      setShowModalGit(true)
    }

    // eventTracking.sendMB('download-pdf-button-click', { projectId })
  }

  return (
    <OLTooltip
      id="sync-git"
      description={description}
      overlayProps={{ placement: 'bottom' }}
    >
      <div>
      <GitSyncModal show={showModalGit} handleHide={() => setShowModalGit(false)} />
      
      <OLButton
        bsStyle="link"
        disabled={isSyncing}
        className="toolbar-item git-btn"
        onClick={handleClick}
        style={{ position: 'relative', background: "none", border: "none", boxShadow: "none" }}
        aria-label={"Sync Git"}
      >
        <Icon type="git" spin={isSyncing} style={{color: isDone ? "#5aff5a" : "white"}} />
        {isDone && <Icon type="check" style={{paddingLeft: "0.4rem", color: "#5aff5a"  }} />}
      </OLButton>
      </div>

    </OLTooltip>
  )
}

export default PdfGitButton
