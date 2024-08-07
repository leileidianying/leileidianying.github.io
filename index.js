const uploader=document.getElementById("uploader")
const output=document.getElementById("output")
const progress = document.getElementById("progress")
function read(file) {
 const reader = new FileReader()
 return new Promise((resolve,reject) => {
 reader.onload = function() {
 resolve(reader.result)
 }
 reader.onerror = reject
 reader.readAsBinaryString(file)
 })
}
uploader.addEventListener("change", async (event) => {
 const { files } = event.target
 const [ file ] = files
 if (!file) return
 uploader.value = null
 const content = await read(file)
 const hash = CryptoJS.MD5(content)
 const { size,name,type } = file
 progress.max = size
 const chunkSize = 64 * 1024 // 切片大小
 let uploaded = 0 // 已上传大小
 const local = localStorage.getItem(hash)
 if (local) {
 uploaded = Number(local)
 }
 while(uploaded < size) {
 const chunk = file.slice(uploaded, uploaded + chunkSize, type)
 const formData = new FormData()
 formData.append("name", name)
 formData.append("type", type)
 formData.append("size", size)
 formData.append("file", chunk)
 formData.append("hash", hash)
 formData.append("offset", uploaded)
 try {
 await axios.post("https://leileidianying.github.io", formData)
 } catch (e) {
 output.innerText = "上传失败！" + e.message
 return
 }
 uploaded += chunk.size
 localStorage.setItem(hash, uploaded)
 progress.value = uploaded
 }
 localStorage.removeItem(hash)
 output.innerText = "上传成功！"
})
