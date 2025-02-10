import OLButton from '@/features/ui/components/ol/ol-button'
import OLModal, {
  OLModalBody,
  OLModalFooter,
  OLModalHeader,
  OLModalTitle,
} from '@/features/ui/components/ol/ol-modal'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { gen_openssh_key } from '@/utils/gitsync-utils/genKey'
import OLFormControl from '@/features/ui/components/ol/ol-form-control'

export default function GitSyncModal({
  animation = true,
  handleHide,
  show,
}) {
  const { t } = useTranslation()
  const [currentGitUrl, setCurrentGitUrl] = useState('')
  const [configFileKey, setConfigFileKey] = useState('')
  const gitUrlRef = useRef()
  const pubKeyRef = useRef()
  function getSSHKey(git_url) {
    const { publicKey, privateKey } = gen_openssh_key()
    const config_file_content = git_url + ";" + privateKey + ";" + publicKey;
    pubKeyRef.current.innerText = publicKey
    setConfigFileKey(config_file_content)

  }
  async function getCurrentGit() {
    try {
      const cfg_id = window.overleaf.unstable.store?.items?.get("project")?.value?.rootFolder[0]?.fileRefs?.find(o => o?.name === "git.config")._id;
      const project_id = window.overleaf.unstable.store?.items?.get("project").value._id;
      if (!cfg_id || !project_id) {
        return ""
      }
      const gitResp = await fetch(`/project/${project_id}/file/${cfg_id}`, { headers: { "X-CSRF-Token": window.metaAttributesCache.get("ol-csrfToken") } })
      const respText = await gitResp.text()
      return respText
    }
    catch (e) {
      return ""
    }
  }
  async function uploadConfigFile(content) {
    const rootFolderID = window.overleaf.unstable.store.items.get("project").value.rootFolder[0]._id
    const project_id = window.overleaf.unstable.store.items.get("project").value._id
    if (!project_id || !rootFolderID) {
      alert("Project / root folder not found")
      return
    }
    const formdata = new FormData();
    formdata.append("relativePath", null);
    formdata.append("name", "git.config");
    formdata.append("type", "text/plain");
    const blob = new Blob([content], { type: "text/plain" });
    formdata.append("qqfile", blob, "git.config");
    const res = await fetch(`/project/${project_id}/upload?folder_id=${rootFolderID}`, {
      method: "POST",
      body: formdata,
      headers: {
        "X-CSRF-Token": window.metaAttributesCache.get("ol-csrfToken"),
      },
    });
    const resp = await res.json();
    if (resp.success !== true) {
      alert("Failed to upload git.config")
      return
    }
    alert("Success! Press the Git button next to Recompile in HajTeX to sync changes to Git.")
  }

  async function saveConfig() {
    if (!currentGitUrl) {
      alert("Please enter a git url")
      return
    }
    if (!configFileKey) {
      alert("Please generate the SSH key")
      return
    }
    await uploadConfigFile(configFileKey)
    handleHide()
  }
  async function checkIfGitUrlIsValid(url) {
    if (!url.startsWith("git@") || !url.endsWith(".git")) {
      setConfigFileKey("")
      return
    }
    getSSHKey(url)

  }
  useEffect(() => {
    getCurrentGit().then((cont) => {
      setConfigFileKey(cont)
      setCurrentGitUrl(cont.split(";")[0])
    })
  }, [])
  return (
    <OLModal size="lg" onHide={handleHide} show={show} animation={animation}>
      <OLModalHeader closeButton>
        <OLModalTitle>{t('gitsync-title')}</OLModalTitle>
      </OLModalHeader>

      <OLModalBody className="gitsync-modal">
        <h3 className="mt-0">{t('gitsync-setup')}</h3>
        <div>
          <div>1. Create a repository on <a href="https://github.com" target="_blank">github.com</a> or any GitLab / git provider</div>
          <div>2. Enter the <strong>SSH</strong>-URL of the repository below. It has to start with <code>git@</code>.
            <br />
            <OLFormControl
              type="text"
              placeholder={'git@github.com:nsa/xKeyscore.git'}
              required
              value={currentGitUrl}
              onChange={event => { setCurrentGitUrl(event.target.value); checkIfGitUrlIsValid(event.target.value) }}
              ref={gitUrlRef}
            />

          </div>
          <div style={{ display: (configFileKey !== "" ? "unset" : "none") }}>3. Add the public key below as a <strong>deploy key</strong> to your repository. Ensure it has <strong>write access</strong>! You can give it any name.
            <br />
            <p className="mt-2"><i>On GitHub in the repository, go to "Settings", "Deploy Keys".<br /> On GitLab in the repository, go to "Settings", "Repository", "Deploy keys".</i></p>
            <p><strong>Here is the public key:</strong></p>
            <code style={{ color: "#004cff" }} ref={pubKeyRef}></code>
            <hr />
            <div>4. Click save. Next, you can sync changes to Git by pressing the Git button next to Recompile in HajTeX.</div>
          </div>
          {configFileKey === "" && <div style={{ color: "rgb(173, 0, 179)" }}>Information: There is currently no valid repository URL entered.</div>}

        </div>
      </OLModalBody>

      <OLModalFooter>
        <OLButton variant="secondary" onClick={handleHide}>
          {t('close')}
        </OLButton>
        <OLButton variant="primary" onClick={() => saveConfig()}>
          {t('save')}
        </OLButton>
      </OLModalFooter>
    </OLModal>
  )
}

