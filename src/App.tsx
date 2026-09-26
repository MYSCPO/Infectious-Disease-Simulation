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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/diseases" element={<DiseaseGalleryPage />} />
      <Route path="/diseases/:id" element={<DiseaseDetailPage />} />
      <Route path="/guide" element={<GuideDocumentPage />} />
      <Route path="/attendance-guide" element={<AttendanceGuidePage />} />
      <Route path="/facilitator/setup" element={<FacilitatorSetupPage />} />
      <Route path="/facilitator/:code/groups" element={<GroupAssignmentPage />} />
      <Route path="/facilitator/:code/present" element={<FacilitatorPresentPage />} />
      <Route path="/facilitator/:code/result" element={<ResultPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/join/:code" element={<JoinPage />} />
      <Route path="/team/:code/:groupId" element={<TeamTrainingPage />} />
      <Route path="/guidebook/:code" element={<GuidebookPage />} />
    </Routes>
  )
}
