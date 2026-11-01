import { Route, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage'
import FacilitatorSetupPage from './pages/FacilitatorSetupPage'
import GroupAssignmentPage from './pages/GroupAssignmentPage'
import JoinPage from './pages/JoinPage'
import TeamTrainingPage from './pages/TeamTrainingPage'
import FacilitatorPresentPage from './pages/FacilitatorPresentPage'
import ResultPage from './pages/ResultPage'
import GuidebookPage from './pages/GuidebookPage'
import DiseaseGalleryPage from './pages/DiseaseGalleryPage'
import DiseaseDetailPage from './pages/DiseaseDetailPage'
import GuideDocumentPage from './pages/GuideDocumentPage'
import AttendanceGuidePage from './pages/AttendanceGuidePage'
import FacilitatorGate from './components/FacilitatorGate'
import SelfSetupPage from './pages/SelfSetupPage'
import SelfDashboardPage from './pages/SelfDashboardPage'
import SelfJoinPage from './pages/SelfJoinPage'
import SelfRunPage from './pages/SelfRunPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/diseases" element={<DiseaseGalleryPage />} />
      <Route path="/diseases/:id" element={<DiseaseDetailPage />} />
      <Route path="/guide" element={<GuideDocumentPage />} />
      <Route path="/attendance-guide" element={<AttendanceGuidePage />} />
      <Route path="/facilitator/setup" element={<FacilitatorSetupPage />} />
      <Route path="/facilitator/:code/groups" element={<FacilitatorGate><GroupAssignmentPage /></FacilitatorGate>} />
      <Route path="/facilitator/:code/present" element={<FacilitatorGate><FacilitatorPresentPage /></FacilitatorGate>} />
      <Route path="/facilitator/:code/result" element={<FacilitatorGate openWhenFinished><ResultPage /></FacilitatorGate>} />
      <Route path="/facilitator/self-setup" element={<SelfSetupPage />} />
      <Route path="/facilitator/:code/self" element={<FacilitatorGate><SelfDashboardPage /></FacilitatorGate>} />
      <Route path="/self/:code" element={<SelfJoinPage />} />
      <Route path="/self/:code/run" element={<SelfRunPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/join/:code" element={<JoinPage />} />
      <Route path="/team/:code/:groupId" element={<TeamTrainingPage />} />
      <Route path="/guidebook/:code" element={<FacilitatorGate openWhenFinished><GuidebookPage /></FacilitatorGate>} />
    </Routes>
  )
}
