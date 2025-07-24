export const softDeleteById = async (Model, id) => {
    const updatedDoc = await Model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedDoc) {
      throw new Error('Document not found or already deleted.');
    }
    return updatedDoc;
};