using System;

namespace API_RRHH_TESIS2025.Helpers
{
    public static class EmbeddingHelper
    {
        public static byte[] FloatsToBytes(float[] floats)
        {
            var bytes = new byte[floats.Length * sizeof(float)];
            Buffer.BlockCopy(floats, 0, bytes, 0, bytes.Length);
            return bytes;
        }

        public static float[] BytesToFloats(byte[] bytes)
        {
            var floats = new float[bytes.Length / sizeof(float)];
            Buffer.BlockCopy(bytes, 0, floats, 0, bytes.Length);
            return floats;
        }

        public static double Euclidean(float[] a, float[] b)
        {
            if (a == null || b == null || a.Length != b.Length) return double.MaxValue;
            double sum = 0;
            for (int i = 0; i < a.Length; i++)
            {
                var d = a[i] - b[i];
                sum += d * d;
            }
            return Math.Sqrt(sum);
        }
    }
}
