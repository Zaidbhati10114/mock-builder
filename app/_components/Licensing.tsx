import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MITLicenseModal() {
  return (
    <Dialog>
      <DialogTrigger className="hover:underline me-4 md:me-6">
        MIT License
      </DialogTrigger>
      <DialogContent className="max-w-lg mx-auto p-6 sm:max-w-xl sm:rounded-lg sm:border sm:shadow-lg">
        <DialogHeader>
          <DialogTitle>MIT License</DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-h-[50vh] overflow-y-auto space-y-4">
          <p>Copyright © 2024 MockBuilder AI</p>
          <p>
            Permission is hereby granted, free of charge, to any person
            obtaining a copy of this software and associated documentation files
            (the Software), to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge,
            publish, distribute, sublicense, and/or sell copies of the Software,
            and to permit persons to whom the Software is furnished to do so,
            subject to the following conditions:
          </p>
          <p>
            The above copyright notice and this permission notice shall be
            included in all copies or substantial portions of the Software.
          </p>
          <p>
            THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
