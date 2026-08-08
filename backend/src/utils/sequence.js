import Counter from "../models/Counter.js";

function extractSequence(code, prefix) {
  if (!code || typeof code !== "string" || !code.startsWith(prefix)) return 0;
  const numericPart = code.slice(prefix.length);
  return /^\d+$/.test(numericPart) ? Number(numericPart) : 0;
}

/**
 * Generate a concurrency-safe business code using an atomic MongoDB counter.
 *
 * The first call bootstraps the counter from the highest existing code so this
 * can be introduced safely into an existing EventFlow database.
 */
export async function nextSequenceCode({
  model,
  counterKey,
  field,
  prefix,
  pad = 5,
}) {
  const existingCounter = await Counter.exists({ _id: counterKey });

  if (!existingCounter) {
    const latest = await model
      .findOne({ [field]: { $regex: `^${prefix}\\d+$` } })
      .sort({ [field]: -1 })
      .select(field)
      .lean();

    const currentMax = extractSequence(latest?.[field], prefix);

    // Atomic upsert: when several requests arrive at the same time, only the
    // first one initializes the sequence and the rest reuse the same counter.
    await Counter.updateOne(
      { _id: counterKey },
      { $setOnInsert: { seq: currentMax } },
      { upsert: true },
    );
  }

  const counter = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true },
  );

  return `${prefix}${String(counter.seq).padStart(pad, "0")}`;
}
