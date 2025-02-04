'use client';
import LoadingComponent from "@/components/loading";
import OCSModal from "@/components/ocsModal";
import ParseHTMLTemplate from "@/components/parseHTML";
import { ESignatureDocument, Roles, TemplateDocument } from "@/lib/modelInterfaces";
import clsx from "clsx";
import { KeyEscapeIcon, PlusIcon } from "evergreen-ui";
import { useCallback, useEffect, useState } from "react";
import AddTemplate from "./addTemplate";
import EditTemplate from "./editTemplate";
import ThumbnailItem from "./thumbnailItem";

export default function IndividualTemplates() {
  const [loading, setLoading] = useState<boolean>(true)
  const [templates, setTemplates] = useState<TemplateDocument[]>([])

  const getTemplatesData = useCallback(() => {
    setLoading(true)
    const url = new URL('/' + Roles.SuperAdmin + '/api/template/all', window.location.origin)
    fetch(url)
      .then(res => res.json())
      .then(({ result }) => { setTemplates(result); setLoading(false) })
      .catch((e) => { console.log(e); setLoading(false) })
  }, [])

  useEffect(() => {
    getTemplatesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDocument>()
  const [openEditTemplate, setOpenEditTemplate] = useState<boolean>(false)
  const [openAddTemplate, setOpenAddTemplate] = useState<boolean>(false)

  const onBack = useCallback(() => {
    getTemplatesData();
    setSelectedTemplate(undefined)
    setOpenEditTemplate(false)
    setOpenAddTemplate(false)
  }, [getTemplatesData])

  const onAddCancel = useCallback(() => {
    setOpenAddTemplate(false)
  }, [])

  const [signatoriesList, setSignatoriesList] = useState<ESignatureDocument[]>([])

  useEffect(() => {
    const url = new URL('/' + Roles.SuperAdmin + '/api/signatories', window.location.origin);
    fetch(url)
      .then(res => res.json())
      .then(({ result }) => setSignatoriesList(result))
      .catch(console.log)
  }, [])

  return (
    <>
      <div className="w-full">
        <h1 className="w-fit mx-auto text-2xl mt-4 font-[500]">For Individual Templates</h1>
        <div className="border border-gray-300 bg-white p-4 rounded-xl mt-4 mx-4">
          <p className="text-gray-600">Number of Individual Templates: {templates.length}</p>
          <button
            type="button"
            onClick={() => onBack()}
            className="px-2 py-1 border rounded bg-gray-300 text-black my-2 mr-2"
          >
            <KeyEscapeIcon display="inline" /> Back
          </button>
          <button
            type="button"
            onClick={() => setOpenAddTemplate(true)}
            className="px-2 py-1 border rounded bg-sky-500 text-black my-2"
          >
            <PlusIcon display="inline" /> Add Template
          </button>
        </div>

        {!openAddTemplate && !openEditTemplate && (
          <div className="min-h-[200px] min-w-[300px] bg-white w-full p-4 lg:min-w-[800px]">
            <div className="border min-w-[300px] rounded-md p-2 lg:min-w-[780px]">
              {loading && <LoadingComponent />}
              {!loading && templates.length === 0 && (
                <div className="text-center text-gray-600">No Templates</div>
              )}

              {!loading && templates.length > 0 && (
                <div className="w-full">
                  {/* Header */}
                  <div className="hidden lg:flex w-full border-b pb-2 font-semibold text-gray-600 px-3">
                    <div className="w-1/12">#</div>
                    <div className="w-6/12">Title</div>
                    <div className="w-3/12">Created</div>
                    <div className="w-2/12 text-center">Updated</div>
                  </div>

                  {/* List Items */}
                  <div className="flex flex-col divide-y">
                    {templates.map((template: TemplateDocument, i: number) => (
                      <div
                        key={template._id}
                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="w-1/12">{i + 1}</div>
                        <div className="w-6/12 flex items-center gap-2">
                          <img
                            src="/thumbnail-document.png"
                            alt="Thumbnail"
                            className="w-8 h-8 object-cover rounded"
                          />
                          {template.title}
                        </div>
                        <div className="w-3/12">
  {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "N/A"}
</div>
                        <div className="w-2/12 text-center">
                          {template.updatedAt
                            ? new Date(template.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {openEditTemplate && !openAddTemplate && !!selectedTemplate && (
          <EditTemplate
            withSignatories={false}
            template={selectedTemplate}
            signatoriesList={signatoriesList}
            onSave={(templateId: string) => onBack()}
            onCancel={onBack}
          />
        )}
        {openAddTemplate && !selectedTemplate && (
          <AddTemplate
            withSignatories={false}
            signatoriesList={signatoriesList}
            onAdd={(templateId: string) => onBack()}
            onCancel={onAddCancel}
          />
        )}
      </div>

      <OCSModal
        title={selectedTemplate?.title}
        open={!!selectedTemplate && !openEditTemplate}
        onClose={() => !openEditTemplate && setSelectedTemplate(undefined)}
      >
        <div
          className={clsx(
            "min-w-[" + 8.5 * 96 + "px]",
            "max-w-[" + 8.5 * 96 + "px]",
            "min-h-[" + 1 * 96 + "px]"
          )}
        >
          {<ParseHTMLTemplate role={Roles.SuperAdmin} htmlString={selectedTemplate?.content || ''} />}
        </div>
        <hr className="border w-full h-[1px] my-2" />
        <div className="w-full flex justify-end items-center gap-x-3 pr-2">
          <button
            type="button"
            className="rounded-lg bg-yellow-300 hover:bg-yellow-100 text-black px-3 py-1"
            onClick={() => setOpenEditTemplate(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-lg bg-gray-300 hover:bg-yellow-100 text-black px-3 py-1"
            onClick={() => setSelectedTemplate(undefined)}
          >
            Close
          </button>
        </div>
      </OCSModal>
    </>
  );
}
