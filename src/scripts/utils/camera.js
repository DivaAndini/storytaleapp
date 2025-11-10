import Swal from "sweetalert2";

export default class Camera {
  #videoElement;
  #stream = null;

  constructor(videoElement) {
    this.#videoElement = videoElement;
  }

  async start() {
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#videoElement.srcObject = this.#stream;
      this.#videoElement.style.display = 'block';
      await this.#videoElement.play();
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      await Swal.fire({
        icon: 'info',
        title: 'Kamera Tidak Dapat Diakses',
        text: 'Pastikan akses kamera sudah diizinkan',
        confirmButtonColor: '#1a467bff',
      });
    }
  }

  capture() {
    if (!this.#videoElement.srcObject) return null;

    const canvas = document.createElement('canvas');
    canvas.width = this.#videoElement.videoWidth;
    canvas.height = this.#videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(this.#videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  }

  stop() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#videoElement.srcObject = null;
      this.#videoElement.style.display = 'none';
      this.#stream = null;
      console.log('Kamera ditutup.');
    }
  }
}
