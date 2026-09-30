// 휴대폰 브라우저는 인쇄 기능으로 PDF를 만드는 방식(react-to-print)을 막거나 무시해서 저장이 안 됐다.
// 그래서 가이드북의 각 section을 이미지로 그려 A4 PDF 파일을 직접 만들어 내려받게 한다.
// 라이브러리가 커서 버튼을 눌렀을 때만 불러온다.
const A4_W = 210
const A4_H = 297

function isInAppBrowser(): boolean {
  return /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent)
}

export async function saveGuidebookPdf(root: HTMLElement, fileName: string): Promise<'saved' | 'shared'> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')])
  await document.fonts?.ready

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const sections = [...root.querySelectorAll<HTMLElement>(':scope > section')]
  let first = true

  for (const section of sections) {
    const canvas = await html2canvas(section, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
    // A4 폭에 맞췄을 때 한 쪽에 들어가는 원본 픽셀 높이
    const pageHeightPx = Math.floor((canvas.width * A4_H) / A4_W)
    for (let y = 0; y < canvas.height; y += pageHeightPx) {
      const sliceH = Math.min(pageHeightPx, canvas.height - y)
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceH
      slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
      if (!first) pdf.addPage()
      first = false
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4_W, (sliceH * A4_W) / canvas.width)
    }
  }

  const name = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  // 카카오톡 등 앱 안 브라우저는 파일 내려받기를 막는 경우가 많아, 가능하면 공유하기(저장·전송)로 넘긴다.
  if (isInAppBrowser()) {
    const file = new File([pdf.output('blob')], name, { type: 'application/pdf' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: name })
      return 'shared'
    }
  }
  pdf.save(name)
  return 'saved'
}
