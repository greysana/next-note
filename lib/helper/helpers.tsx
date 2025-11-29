// Add this function at the top of your route files
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
